import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})

const bucket = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = 300

// TODO: Implement the fileStogare logic
export function createAttachmentPresignedUrl(imageId: string) {
    return s3.getSignedUrl('putObject', {
        Bucket: bucket,
        Key: imageId,
        Expires: urlExpiration
    })
}