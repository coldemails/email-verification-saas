import { Parser } from '@json2csv/plainjs';

router.get('/jobs/:jobId/download', async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get all results for this job
    const results = await prisma.verification_results.findMany({
      where: { jobId },
      select: {
        email: true,
        status: true,
        reason: true,
        smtpValid: true,
        hasMxRecord: true,
        isDisposable: true,
        isRoleAccount: true,
        isCatchAll: true,
      },
    });

    // Convert to CSV
    const parser = new Parser();
    const csv = parser.parse(results);

    // Send as downloadable file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=results-${jobId}.csv`);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download results' });
  }
});