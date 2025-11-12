import prisma from '../utils/prisma';
import fs from 'fs';
import path from 'path';

interface ExportResult {
  email: string;
  status: string;
  syntaxValid: string;
  dnsValid: string;
  isDisposable: string;
  isRoleAccount: string;
  reason: string;
}

export const generateResultCSV = async (jobId: string): Promise<string> => {
  // Get all results for this job
  const results = await prisma.verificationResult.findMany({
    where: { jobId },
  });

  if (results.length === 0) {
    throw new Error('No results found for this job');
  }

  // Convert to CSV format
  const csvData: ExportResult[] = results.map((result) => ({
    email: result.email,
    status: result.status,
    syntaxValid: result.smtpValid ? 'Yes' : 'No',
    dnsValid: result.hasMxRecord ? 'Yes' : 'No',
    isDisposable: result.isDisposable ? 'Yes' : 'No',
    isRoleAccount: result.isRoleAccount ? 'Yes' : 'No',
    reason: result.reason || 'N/A',
  }));

  // Generate CSV content
  const headers = 'Email,Status,Syntax Valid,DNS Valid,Is Disposable,Is Role Account,Reason\n';
  const rows = csvData
    .map(
      (row) =>
        `${row.email},${row.status},${row.syntaxValid},${row.dnsValid},${row.isDisposable},${row.isRoleAccount},"${row.reason}"`
    )
    .join('\n');

  const csvContent = headers + rows;

  // Save to file
  const resultsDir = path.join(__dirname, '../../results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const fileName = `results-${jobId}.csv`;
  const filePath = path.join(resultsDir, fileName);

  fs.writeFileSync(filePath, csvContent, 'utf-8');

  return filePath;
};