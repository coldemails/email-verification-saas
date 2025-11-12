import { Request, Response } from 'express';
import multer from 'multer';
import csvParser from 'csv-parser';
import fs from 'fs';
import path from 'path';
import prisma from '../utils/prisma';
import { startVerification } from '../services/queueService';
import { generateResultCSV } from '../services/exportService';

// -------------------------------------------------------------
// MULTER CONFIG
// -------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

export const uploadCSV = upload.single('file');

// -------------------------------------------------------------
// STEP 1: CONFIRM EMAIL COLUMN
// -------------------------------------------------------------
export const confirmEmailColumn = async (req: Request, res: Response) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = path.join(process.cwd(), file.path);
    const headers: string[] = [];
    let totalRows = 0;

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('headers', (csvHeaders) => {
          console.log('🧾 Detected CSV headers:', csvHeaders);
          headers.push(...csvHeaders);
        })
        .on('data', () => totalRows++)
        .on('end', resolve)
        .on('error', reject);
    });

    return res.json({
      headers,
      totalEmails: totalRows,
      filePath: path.resolve(file.path),
      originalFileName: file.originalname, // ✅ Added this line
      message: 'Headers and total email rows detected successfully',
    });
  } catch (error) {
    console.error('❌ Error detecting CSV headers:', error);
    res.status(500).json({ error: 'Failed to detect CSV headers' });
  }
};
// -------------------------------------------------------------
// STEP 2: CREATE VERIFICATION JOB
export const createVerificationJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'dev-user-1';
    const uploadedFilePath = req.body.filePath;
    const selectedColumn = req.body.selectedColumn;
    const originalFileName = req.body.originalFileName; // ✅ Added this line
    const file = req.file;

    console.log('📂 File received:', file?.path || uploadedFilePath);
    console.log('📂 Original filename:', originalFileName);
    console.log('🧾 Selected column:', selectedColumn);

    const resolvedPath = file
      ? path.resolve(file.path)
      : uploadedFilePath
      ? path.isAbsolute(uploadedFilePath)
        ? uploadedFilePath
        : path.resolve(process.cwd(), uploadedFilePath)
      : null;

    if (!resolvedPath || !fs.existsSync(resolvedPath)) {
      console.error('❌ File not found at:', resolvedPath);
      return res.status(400).json({ error: 'File not found on server', resolvedPath });
    }

    console.log('📂 Using absolute file path:', resolvedPath);

    if (!selectedColumn || selectedColumn.trim() === '') {
      console.error('❌ No column selected');
      return res.status(400).json({ error: 'Please select a column containing emails' });
    }

    const emails: string[] = [];
    const selectedColumnLower = selectedColumn.trim().toLowerCase();

    await new Promise<void>((resolve, reject) => {
      let rowCount = 0;
      
      fs.createReadStream(resolvedPath)
        .pipe(csvParser())
        .on('data', (row) => {
          rowCount++;
          
          const normalizedRow: Record<string, string> = {};
          for (const key of Object.keys(row)) {
            normalizedRow[key.trim().toLowerCase()] = row[key];
          }

          if (rowCount <= 3) {
            console.log(`🔍 Row ${rowCount} original keys:`, Object.keys(row));
            console.log(`🔍 Row ${rowCount} normalized keys:`, Object.keys(normalizedRow));
            console.log(`🔍 Looking for column: "${selectedColumnLower}"`);
          }

          const emailValue = normalizedRow[selectedColumnLower];

          if (emailValue && emailValue.trim()) {
            const trimmedEmail = emailValue.trim().toLowerCase();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (emailRegex.test(trimmedEmail)) {
              emails.push(trimmedEmail);
              if (emails.length <= 5) {
                console.log(`✅ Valid email found: ${trimmedEmail}`);
              }
            } else {
              if (rowCount <= 5) {
                console.warn(`⚠️ Invalid email format in row ${rowCount}: "${trimmedEmail}"`);
              }
            }
          } else {
            if (rowCount <= 5) {
              console.warn(`⚠️ No value found for column "${selectedColumn}" in row ${rowCount}`);
            }
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`✅ Extracted ${emails.length} valid emails from ${resolvedPath}`);
    console.log('📧 First 5 emails:', emails.slice(0, 5));

    if (emails.length === 0) {
      console.error('⚠️ No valid emails found in the selected column');
      return res.status(400).json({ 
        error: 'No valid emails found in the selected column. Please select the correct column containing email addresses.',
        selectedColumn,
        hint: 'Make sure the column contains valid email addresses in the format: user@domain.com'
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.credits < emails.length) {
      return res.status(400).json({
        error: 'Insufficient credits',
        required: emails.length,
        available: user?.credits || 0,
      });
    }

    // ✅ Create verification job with both filenames
    const job = await prisma.verificationJob.create({
      data: {
        userId,
        fileName: originalFileName || path.basename(resolvedPath), // ✅ Store original name
        serverFileName: path.basename(resolvedPath), // ✅ Store server name
        totalEmails: emails.length,
        status: 'PENDING',
        uploadedFileUrl: resolvedPath,
      },
    });

    await startVerification(job.id, resolvedPath, selectedColumn);
    console.log(`🚀 Job ${job.id} queued (${emails.length} emails)`);

    return res.json({
      success: true,
      jobId: job.id,
      totalEmails: emails.length,
      message: 'Verification job created successfully',
    });
  } catch (error) {
    console.error('❌ Error creating verification job:', error);
    res.status(500).json({ error: 'Failed to create verification job' });
  }
};

// -------------------------------------------------------------
// JOB MANAGEMENT ROUTES
// -------------------------------------------------------------
export const getJobs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'dev-user-1';
    const jobs = await prisma.verificationJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ jobs });
  } catch (error) {
    console.error('❌ Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

export const deleteJob = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || 'dev-user-1';
    const { id } = req.params;

    const job = await prisma.verificationJob.findFirst({ where: { id, userId } });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    if (job.uploadedFileUrl && fs.existsSync(job.uploadedFileUrl)) {
      fs.unlinkSync(job.uploadedFileUrl);
    }

    await prisma.verificationJob.delete({ where: { id } });
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
};

export const downloadResults = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = await prisma.verificationJob.findUnique({ where: { id } });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    if (job.status !== 'COMPLETED')
      return res.status(400).json({ error: 'Job not completed yet' });

    const filePath = await generateResultCSV(id);
    res.download(filePath, `results-${job.fileName}`, (err) => {
      if (err) console.error('Download error:', err);
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error('❌ Error downloading results:', error);
    res.status(500).json({ error: 'Failed to download results' });
  }
};
