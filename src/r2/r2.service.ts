import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Inject, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { v4 as uuid } from 'uuid';

type MulterFile = NonNullable<Request['file']>

@Injectable()
export class R2Service {
    constructor(
        @Inject('R2')
        private readonly r2: S3Client
    ) { }

    async uploadImage(
        file: MulterFile,
        folder: string
    ): Promise<string> {
        if (!file.buffer) {
            throw new Error("No file provided");
        }

        const allowedMimeTypes = [
            'image/png',
            'image/jpg',
            'image/jpeg',
            'image/gif',
            'image/webp'
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new Error("Invalid file type");
        }

        const extension = file.originalname.split('.').pop();

        const key = `${folder}/${uuid()}.${extension}`;

        await this.r2.send(
            new PutObjectCommand({
                Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype
            })
        );

        return `${process.env.CLOUDFLARE_PUBLIC_URL}/${key}`
    }

    async deleteImage(url: string): Promise<{ success: boolean }> {
        const key = this.extractKey(url);

        await this.r2.send(
            new DeleteObjectCommand({
                Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
                Key: key
            }),
        );
        return { success: true }
    }

    private extractKey(url: string): string {
        const { pathname } = new URL(url);
        return pathname.replace(/^\//, '');
    }
}
