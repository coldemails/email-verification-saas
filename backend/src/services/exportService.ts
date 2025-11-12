import prisma from '../utils/prisma';
import fs from 'fs';
import path from 'path';

export const generateResultCSV = async (jobId: string): Promise<string> => {
  try {
    console.log(`📄 Generating CSV for job ${jobId}`);

    // Get job and results
    const job = await prisma.verificationJob.findUnique({
      where: { id: jobId },
      include: {
        results: {
          orderBy: {
            verifiedAt: 'asc',
          },
        },
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.results.length === 0) {
      throw new Error('No results found for this job');
    }

    // Create CSV content
    const headers = [
      'Email',
      'Status',
      'Reason',
      'SMTP Valid',
      'Has MX Record',
      'MX Records',
      'Is Catch-All',
      'Is Disposable',
      'Is Role Account',
      'Verified At',
    ];

    const rows = job.results.map((result) => [
      result.email,
      result.status,
      result.reason || '',
      result.smtpValid === null ? 'Unknown' : result.smtpValid ? 'Yes' : 'No',
      result.hasMxRecord === null ? 'Unknown' : result.hasMxRecord ? 'Yes' : 'No',
      result.mxRecords || '',
      result.isCatchAll === null ? 'Unknown' : result.isCatchAll ? 'Yes' : 'No',
      result.isDisposable ? 'Yes' : 'No',
      result.isRoleAccount ? 'Yes' : 'No',
      result.verifiedAt.toISOString(),
    ]);

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    // Save to temp file
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const filename = `results-${jobId}-${Date.now()}.csv`;
    const filePath = path.join(tempDir, filename);

    fs.writeFileSync(filePath, csvContent, 'utf8');

    console.log(`✅ CSV generated: ${filePath}`);

    return filePath;
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
};

// Generate separate CSV files for each status
export const generateSegmentedResults = async (
  jobId: string
): Promise<{
  valid: string;
  invalid: string;
  risky: string;
  unknown: string;
}> => {
  try {
    console.log(`📄 Generating segmented CSVs for job ${jobId}`);

    const job = await prisma.verificationJob.findUnique({
      where: { id: jobId },
      include: {
        results: true,
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const filePaths = {
      valid: '',
      invalid: '',
      risky: '',
      unknown: '',
    };

    // Group results by status
    const grouped = {
      VALID: job.results.filter((r) => r.status === 'VALID'),
      INVALID: job.results.filter((r) => r.status === 'INVALID'),
      RISKY: job.results.filter((r) => r.status === 'RISKY'),
      UNKNOWN: job.results.filter((r) => r.status === 'UNKNOWN'),
    };

    // Generate CSV for each group
    for (const [status, results] of Object.entries(grouped)) {
      if (results.length > 0) {
        const headers = ['Email', 'Reason', 'Verified At'];
        const rows = results.map((result) => [
          result.email,
          result.reason || '',
          result.verifiedAt.toISOString(),
        ]);

        const csvContent = [
          headers.join(','),
          ...rows.map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
          ),
        ].join('\n');

        const filename = `${status.toLowerCase()}-${jobId}-${timestamp}.csv`;
        const filePath = path.join(tempDir, filename);

        fs.writeFileSync(filePath, csvContent, 'utf8');

        filePaths[status.toLowerCase() as keyof typeof filePaths] = filePath;
      }
    }

    console.log(`✅ Segmented CSVs generated for job ${jobId}`);

    return filePaths;
  } catch (error) {
    console.error('Error generating segmented CSVs:', error);
    throw error;
  }
};

export default {
  generateResultCSV,
  generateSegmentedResults,
};
