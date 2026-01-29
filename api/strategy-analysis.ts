// /api/strategy-analysis.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  return res.status(200).json({
    report: {
      companyProfile: 'Demo Company',
      industryPosition: 'Demo Industry',
      financialAnalysis: 'Demo Financial',
      growthPotential: 'Demo Growth',
      competitiveAdvantage: 'Demo Moat',
      riskFactors: 'Demo Risks',
      investmentAdvice: 'HOLD',
      targetPriceZone: '100–120'
    }
  });
}
