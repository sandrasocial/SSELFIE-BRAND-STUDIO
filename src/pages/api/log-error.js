import errorLogger from '../../middleware/errorLogger';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { error, errorInfo, location, timestamp } = req.body;

    // Log the error using our middleware
    const errorDetails = {
      message: error,
      info: errorInfo,
      location,
      timestamp,
    };

    // Here you would typically save to your database or logging service
    console.error('Client Error:', errorDetails);

    return res.status(200).json({ message: 'Error logged successfully' });
  } catch (err) {
    return errorLogger(err, req, res);
  }
}