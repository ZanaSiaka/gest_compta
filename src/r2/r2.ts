import { S3Client } from '@aws-sdk/client-s3'
export const R2 = {

    provide: 'R2',
    useFactory: () => {
        return new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY as string,
                secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY as string
            }
        })
    }

}
