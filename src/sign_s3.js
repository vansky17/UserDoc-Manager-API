const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const storageDriver = process.env.STORAGE_DRIVER || 's3';
const localUploadDirectory = process.env.LOCAL_UPLOAD_DIR || path.join(__dirname, '..', 'uploads');

const S3_BUCKET = process.env.S3_BUCKET_NAME;

const safeFilePart = value => String(value || '')
  .trim()
  .replace(/[^a-zA-Z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '');

const createObjectKey = (fileName, fileType) => {
  const parsedName = path.parse(String(fileName || ''));
  const baseName = safeFilePart(parsedName.name || fileName) || 'document';
  const extension = safeFilePart(fileType || parsedName.ext.replace('.', '')).toLowerCase();
  const uniqueSuffix = crypto.randomUUID();

  return `${baseName}-${uniqueSuffix}${extension ? `.${extension}` : ''}`;
};

const createS3Client = () => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  return new S3Client({
    region: process.env.S3_REGION || 'us-east-2',
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    credentials: accessKeyId && secretAccessKey
      ? { accessKeyId, secretAccessKey }
      : undefined
  });
};

exports.sign_s3 = async (req, res, next) => {
  const objectKey = createObjectKey(req.body.fileName, req.body.fileType);

  if (storageDriver === 'local') {
    const origin = `${req.protocol}://${req.get('host')}`;
    return res.json({
      success: true,
      data: {
        returnData: {
          signedRequest: `${origin}/api/upload/local/${encodeURIComponent(objectKey)}`,
          url: `${origin}/uploads/${encodeURIComponent(objectKey)}`
        }
      }
    });
  }

  try {
    if (!S3_BUCKET) {
      return res.status(503).json({ error: { message: 'Object storage is not configured' } });
    }

    const s3 = createS3Client();
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: objectKey,
      ContentType: req.body.contentType || 'application/octet-stream'
    });
    const signedRequest = await getSignedUrl(s3, command, { expiresIn: 300 });
    const publicBaseUrl = process.env.STORAGE_PUBLIC_BASE_URL
      || `https://${S3_BUCKET}.s3.${process.env.S3_REGION || 'us-east-2'}.amazonaws.com`;

    return res.json({
      success: true,
      data: {
        returnData: {
          signedRequest,
          url: `${publicBaseUrl.replace(/\/$/, '')}/${encodeURIComponent(objectKey)}`
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

exports.receive_local_upload = (req, res, next) => {
  if (storageDriver !== 'local') {
    return res.status(404).json({ error: { message: 'Local storage is disabled' } });
  }

  try {
    const fileName = path.basename(req.params.fileName);
    fs.mkdirSync(localUploadDirectory, { recursive: true });
    fs.writeFileSync(path.join(localUploadDirectory, fileName), req.body);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
};
