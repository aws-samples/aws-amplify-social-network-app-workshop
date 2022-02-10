+++
title="Set up Cloud9"
date = 2020-03-18T20:09:42+09:00
weight = 2
pre = "<b>10.1. </b>"
+++

{{% notice info%}}
We recommend you to run this workshop on **local environment**.
If you have difficulty setting up `Node.js` or `npm` in your local environment, you can use [AWS Cloud9](https://aws.amazon.com/jp/cloud9/); the cloud-based integrated development environment (IDE) provided by AWS .
For more information, see [10.1. Set up Cloud9](/100_supplemental_resource/10_cloud9.html).
However, for Amplify Mocking, port 20002 must be available and may not be available in some Cloud IDEs.
Please understand in advance.
{{% /notice%}}

### Setting Up Cloud9

[AWS Cloud9](https://aws.amazon.com/cloud9/?nc1=h_ls) is a cloud-based integrated development environment (IDE) 
Log in to the AWS Management Console and launch an instance of Cloud9 that you use to develop in this workshop.

1. Choose Cloud9 from the AWS Management Console.
2. Click on the "Create environment" button.
![create iam user](/images/00_prequisites/management-console-cloud9-2.png)
1. In Name, enter a name for the environment. (e.g. amplify-handson-{date}, etc.) <br>"Description" is optional. Please enter a descriptive text that is easy to understand.
![create iam user](/images/00_prequisites/management-console-cloud9-3.png)
4. For Instance Type, choose m5.large.
If you use other size, it may run out of memory during build.
Leave the default for the other items and click "Next step".
![create iam user](/images/00_prequisites/management-console-cloud9-4.png)
5. Confirm the settings and click "Create Environment".
![create iam user](/images/00_prequisites/management-console-cloud9-5.png)
6. Wait a while and if the following screen appears, it is successful.
![create iam user](/images/00_prequisites/management-console-cloud9-6.png)

### Resize EBS

[Elastic Block Store(EBS)](https://aws.amazon.com/jp/ebs) is attatched to the EC2 instance used by Cloud9.
`no space left on device, write` error may be caused by insufficient storage space.
We recommend you to increase volume size of EBS.

```shell
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)

VOLUME_ID=$(aws ec2 describe-volumes \
  --query "Volumes[?Attachments[?InstanceId=='$INSTANCE_ID']].{ID:VolumeId}" \
  --output text)

aws ec2 modify-volume --volume-id $VOLUME_ID --size 32 
```

{{% notice info%}}
`INSTANCE_ID...` calls [EC2 instance metadata](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ec2-instance-metadata.html) endpoint to fetch Instance ID of EC2 instance use by Cloud9.
`VOLUME_ID...` fetches EBS volume ID using EC2 instance ID.
`aws ec2...` increases volume size to 32 GiB
{{% /notice %}}

Confirm Cloud9 uses newly added storage.
```
sudo growpart /dev/nvme0n1 1

sudo xfs_growfs -d /
```

### Disable AWS Managed Temporary Credentials

AWS Cloud9 creates managed temporary AWS credentials the first time you open the console.

In the following steps, you disable the AWS Cloud9 temporary credentials in order to use another credential at after steps.

AWS Cloud9 > Preferences > AWS SETTINGS > Toggle "AWS managed temporary credentials:" Off to the default.
![create iam user](/images/00_prequisites/cloud9-tmp-credential-off.png)