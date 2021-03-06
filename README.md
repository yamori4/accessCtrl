## アクセスコントロールアプリ -AccessCtrl-

本アプリケーションは、許可されたPCからのみWEBサーバへのアクセスを許可する、いわゆる「端末制限」のためのサンプルアプリです。概要はこんな感じです↓

<img src="README_img/アプリ概要図.jpg" alt="アプリ概要図" title="アプリ概要図" width="600px">

クライアント側(図の左)にはChrome(他のブラウザでは動作確認未実施)の拡張機能をインストール、サーバ側(図の右)はウェブサービスに簡単なスクリプト(今回はPHP)を組み込むことを想定してます。

クライアント側の設定はブラウザに拡張機能をインストールするだけで、お手軽な割にそこそこのセキュリティが担保できる仕組みです。小～中規模くらいの自前のウェブサービスで利用する場合に便利だと思います。

本アプリはサンプルなので、そのままだと実用には堪えないです。ご自身の環境に合わせて改修して使ってもらうか、端末制限実現の参考までにしてもらえればればと思います。



## 端末制限について

昨今、働き方改革だのでリモートワークについてあちこちで言われてますけど、リモートワーク自体は昔からあるわけでVPN使えばいいわけですよ。じゃあなんで使わないのかというと、ある程度はコストが掛かるし設定も面倒くさいしで、雇われる側がやる気だしても経営者側がその気になんないと中々リモートワークは実現できないだろうと思いますね。

それに社外から接続できるってのは、謂わば「特例」ですから、多かれ少なかれリスクになりえるので、上手く運用しないとそれ自体がセキュリティホールにもなるかもしれない、経営者側からすると導入に二の足を踏むというのも理解できなくはないです。

端末制限を実現するための方法として、私がパッと思いつくのが以下の５つの方式です。簡単な説明も書いておきましたが、WEBで検索するともっと詳しい説明がいっぱいあるので、興味のある方はご自身で調べてみてください。

- <b>VPN</b>

  一番間違いない方法。真剣にセキュリティを考えるならば多少のコストはかかっても実績がある商品のVPNを導入したほうがいいです。独自アプリをインストールする必要があったりとか専用機器を購入する必要があったりものなどもあって、方式が何種類あるのでニーズにあったものを購入するといいと思います。

- <b>platform組み込みのFIDOを使った認証</b>
  
  個人的に凄くおすすめの方式です。2020年の現時点でもまだまだ新しい技術なので対応はちょっと難しいかもしれませんが、端末制限だけでなく生体認証を用いてのパスワードレス認証も可能ですし、加えてフィッシング詐欺に対する高い耐性があります。すでにWindows10を使用しているならWindows HelloのFIDO機能を使えばコストもかなり抑えることができます。

- <b>証明書を使った認証</b>

  VPNの一種。TLSのオプションの規格でクライアント証明書による認証を利用します。有効期限を設定できるし、運用を間違えなければセキュアではあるけど、認証局からクライアント証明書を発行する必要があり、方法にもよりますがコストがかります。自前で認証局を用意する手もあるがそれはそれで手間がかかります。商品として提供されているものを使わずに自力でやるとなると、ちょっと難易度が高いかもしれないです。自力での構築で複数サービスでの利用を求められた場合に、設定が複数箇所に及ぶとなると結構面倒だと思います。

- <b>IPアドレス制限</b>

  仕組みが分かりやすく割と簡単に実現できます。アプリケーション内部のプログラムでもできるし、ファイアーウォールの設定でもできます、ApacheやNginxの設定でも可能です。でも、クライアント側が固定IPアドレスじゃないといけないので、毎回アドレスが変わるポケットWi-Fiやスマホのテザリングだと使えないです。

- <b>クッキー(Cookie)を使った認証</b>

  https通信の使用が前提です。事前にクライアントの端末にパスコードとなるCookieを設定しておき、その値を検証することにより端末制限を実現します。SaaSアプリにこの機能を組み込むと便利だと思います。すごくお手軽ですがブラウザでCookieを削除すると使えなくなり、再設定が必要になります。また、Cookieの属性の設定を失敗するとパスコードが漏洩する危険性もあります。
  

本アプリケーションは最後のクッキーを使う方式をベースに、それにひと手間加えてTOTPの要素を付け加えてます。



## 構築＆使い方

本サンプルアプリの構築手順です。大まかには、クライアント側・サーバ側の両方で環境構築して、両方でシークレットキーを共有します。

#### クライアント側の設定

Chromeに拡張機能をインストールします。

1. サンプルソースをダウンロードして、適当な場所に配置します。GitHubの「Clone or download」でダウンロードできます。「AccessCtrl_client」フォルダをクライアント側で利用します。

   <img src="README_img/ソースダウンロード.jpg" alt="ソースダウンロード" title="ソースダウンロード">

2. chromeの拡張機能の設定画面を開く。アドレスバーに「chrome://extensions/」と入力する。

   <img src="README_img/アドレスバー入力.jpg" alt="アドレスバー入力" title="アドレスバー入力" width="600px">

3. "デベロッパーモード"を"ON"にし、「パッケージ化されていない拡張機能を読み込む」ボタンをクリックします。

   <img src="README_img/デベロッパーモード.jpg" alt="デベロッパーモード" title="デベロッパーモード" width="600px">

   【補足】デベロッパーモードをONにすると、次回のChromeの起動時に以下のようなメッセージが表示されるようになります。これを表示しないようにするにはGoogleのウェブストアに拡張機能を公開して、そこからダウンロードして利用すればいいです。(※ちょっとお金がかかります。)

   <img src="README_img/デベロッパーモードの拡張機能を無効にする.jpg" alt="デベロッパーモードの拡張機能を無効にする" title="デベロッパーモードの拡張機能を無効にする" width="300px">

4. ダウンロードしたサンプルソースのフォルダーを選択して取り込みます。

   <img src="README_img/拡張機能取り込み.jpg" alt="拡張機能取り込み" title="拡張機能取り込み" width="600px">

5. 取り込みが完了すると拡張機能の一覧と、アドレスバーの横に取り込んだアプリが表示されます。

   <img src="README_img/拡張機能インストール.jpg" alt="拡張機能インストール" title="拡張機能インストール" width="300px">　<img src="README_img/アドレスバーの横.jpg" alt="アドレスバーの横" title="アドレスバーの横" width="300px">

   

#### サーバ側の設定

Webアプリケーションにスクリプトを組み込みます。

1. ウェブサーバの構築します。サンプルはPHPなので、それが動く環境であれば何でもいいですが、ここではXamppを使います。(※Xamppの設定手順はこちらを参考にしてください→https://github.com/yamori4/objectOriented/blob/master/_readMe/installXampp.md)

2. サンプルソースをダウンロードして、xamppの制御下に配置します。「C:\xampp」にインストールした場合だと「C:\xampp\htdocs」というフォルダあるので、その配下に配置します。ソースコードはGitHubの「Clone or download」でダウンロードできます。「AccessCtrl_server」フォルダをサーバ側で利用します。

   <img src="README_img/ソースダウンロード.jpg" alt="ソースダウンロード" title="ソースダウンロード"><img src="README_img/xamppへのファイル配置.jpg" alt="xamppへのファイル配置" title="xamppへのファイル配置" width="600px">

3. XamppのApacheを起動します。Apacheの「Startボタン」をクリックします。

   <img src="README_img/controlPanel.jpg" alt="controlPanel" title="controlPanel" width="500px">

4. Chromeを起動して、アドレスバーに「 https://localhost/AccessCtrl_server/index.php 」と入力してみてください。以下のような画面が表示されます。

<img src="README_img/サーバエラー画面.jpg" alt="サーバエラー画面" title="サーバエラー画面" width="550px">



#### シークレットキーの共有設定

クライアント側とサーバ側で共通のキーを設定します。ここでは共通のシークレットキーを「OpenSesame」としています。

1. Chromeのアドレスバー横にあるアイコンをクリックします。

   <img src="README_img/Chrome側シークレットキー設定.jpg" alt="Chrome側シークレットキー設定" title="Chrome側シークレットキー設定" width="200px">

2. 「Secret Key Setting」欄に「OpenSesame」と設定し、「Submit」ボタンをクリックします。(※画面上では伏字になってますが、すでに初期値として設定しています。)

3. 「ON/OFF」ボタンをクリックして拡張機能アプリを"ON"にします。そうするとアイコン画像が変化します。(※使用しない時はOFFにしておけばいいです。)

   <img src="README_img/拡張機能ON.jpg" alt="拡張機能ON" title="拡張機能ON" width="200px">

4. 次はサーバ側にシークレットキーを設定します。「 https://localhost/AccessCtrl_server/index.php 」のindex.phpファイルをメモ帳などで開き、4行目の「SECRET_KEY」の値を「OpenSesame」と設定し、保存します。

   <img src="README_img/サーバ側シークレットキー設定.jpg" alt="サーバ側シークレットキー設定" title="サーバ側シークレットキー設定" width="800px">

5. これで、シークレットキーの設定は完了です。Chromeでウェブページを見てみましょう。CookieのTOTPの値がサーバ側で生成したTOTPの値が一致しており、認証に成功しています。

   <img src="README_img/TOTP認証成功.jpg" alt="TOTP認証成功" title="TOTP認証成功" width="600px">

   また、試しに間違ったシークレットキーに設定してみます。TOTPの値が一致せず認証に失敗します。こういった場合にHttpStatusCodeで403を返したり、ログイン処理をさせなかったり、強制ログアウトを実施したりしてアクセスを禁止すればいいです。

   <img src="README_img/TOTP認証失敗.jpg" alt="TOTP認証失敗" title="TOTP認証失敗" width="600px">



<b>以上</b>













