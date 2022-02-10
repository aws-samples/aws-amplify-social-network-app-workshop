+++
title = "Cloud9のセットアップ"
date = 2020-03-18T20:09:42+09:00
weight = 2
pre = "<b>10.1. </b>"
+++

{{% notice info%}}
本ワークショップは**ローカル環境での実施を推奨**します。
ローカル環境での`node.js`や`npm`のセットアップが困難な方は、AWS が提供するクラウドベースの統合開発環境 (IDE)である[AWS Cloud9](https://aws.amazon.com/jp/cloud9/)をお使いください。
ただし、Amplify Mocking(手元での動作確認)には20002番ポートが利用可能である必要があり、一部の Cloud IDE では利用できないことがあります。
あらかじめご了承ください。
{{% /notice %}}


---


### Cloud9 のセットアップ

Amplify ワークショップではクラウドベースの統合開発環境 (IDE)である[AWS Cloud9](https://aws.amazon.com/jp/cloud9/)上で開発を行います。AWS マネジメントコンソールにログインし、今回開発に使用する Cloud9 のインスタンスを起動します。

1.マネジメントコンソールから Cloud9 を選択 ![create iam user](/images/00_prequisites/management-console-cloud9-1.png)
<br><br> 2.「Create environment」ボタンを押下 ![create iam user](/images/00_prequisites/management-console-cloud9-2.png)
<br><br>

1. 「Name」に環境名を入力します。(例 amplify-handson-<日付> 等) <br>「Description」は任意項目です。わかりやすい説明文を入力してください。 ![create iam user](/images/00_prequisites/management-console-cloud9-3.png)
   <br><br> 4.「Instance Type」に m5.large を選択します。小さいサイズを選択するとビルド時にメモリが不足する可能性があります。他の項目はデフォルトのままで「Next step」を押下します。 
   ![create iam user](/images/00_prequisites/management-console-cloud9-4.png)
   <br><br> 5.設定内容を確認し、「Create Environment」を押下します。 
   ![create iam user](/images/00_prequisites/management-console-cloud9-5.png)
   <br><br> 6.しばらく待って以下のような画面が表示されれば成功です。 

   ![create iam user](/images/00_prequisites/management-console-cloud9-6.png)

   <br><br>

### EBS(ストレージ)のリサイズ
Cloud9はEC2インスタンス上に環境を作成します。
そのEC2インスタンスには[Elastic Block Store(EBS)](https://aws.amazon.com/jp/ebs)がアタッチされています。
デフォルトで今回立ち上げたCloud9の作業環境に割り当てられたEBSでは`no space left on device, write`エラーが発生する場合があります。
そこで、次のスクリプトを実行してEBSボリュームのサイズを引き上げます。

```shell
INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)

VOLUME_ID=$(aws ec2 describe-volumes \
  --query "Volumes[?Attachments[?InstanceId=='$INSTANCE_ID']].{ID:VolumeId}" \
  --output text)

aws ec2 modify-volume --volume-id $VOLUME_ID --size 32 
```

{{% notice info%}}
最初のコマンド(`INSTANCE_ID...`)では、[EC2 instance metadata](https://docs.aws.amazon.com/ja_jp/AWSEC2/latest/UserGuide/ec2-instance-metadata.html) のエンドポイントをコールして、Cloud9が使用するEC2インスタンスのインスタンスIDを取得しています。
次のコマンド(`VOLUME_ID...`)では、AWS CLIを用いてEBSボリュームのIDを取得しています。
最後のコマンド(`aws ec2...`)では、EBSボリュームのサイズを32GiBに引き上げています。
{{% /notice %}}

最後に、割り当てたストレージ領域をCloud9が利用していることを確認しましょう。
```
sudo growpart /dev/nvme0n1 1

sudo xfs_growfs -d /
```

### AWS 管理の一時認証情報 の無効化

Cloud9 では最初にコンソールを開いたときに AWS 管理の一時認証情報が作成されます。<br>
以降の手順では、Amplify CLI で発行するユーザの権限を使用するため、Cloud9 の一時認証情報を無効化します。

AWS Cloud9 > Preferences > AWS SETTINGS > 「AWS managed temporary credentials:」 のトグルを Off にします。 ![create iam user](/images/00_prequisites/cloud9-tmp-credential-off.png)
