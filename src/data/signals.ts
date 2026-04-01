export interface SignalImage {
  url: string;
  thumbUrl?: string;
  alt?: string;
  source?: string;
  sourceLabel?: string;
}

export interface Signal {
  id: string | number; // UUID from Supabase, or legacy number
  number: number;
  title: string;
  body: string;
  images: SignalImage[];
  category?: string;
  tags?: string[];
  year: number;
  reference?: string;
  /** Manual crop hint: "contain" for infographics, or CSS object-position like "25% 50%" */
  focalHint?: string;
}

export const signals: Signal[] = [
  {
    id: 1,
    number: 1,
    title: "サーキュラーモデルを促すFairphone",
    body: "Fairphoneは、モジュール形式でユーザーが自ら部品を交換して修理できる構造で作られている。既存製品・部品・資源を最大限活用し、それらの価値を目減りさせずに永続的に再生・再利用し続けるサーキュラーエコノミー型のビジネスモデルが理想から現実に変わりつつある。",
    images: [
      { url: "/images/image3.png", alt: "サーキュラーモデルを促すFairphone" },
      { url: "/images/image9.png", alt: "サーキュラーモデルを促すFairphone" },
    ],
    category: "Circular Economy",
    year: 2026,
    reference: "https://www.fairphone.com/",
  },
  {
    id: 2,
    number: 2,
    title: "ぬいぐるみの「整形手術」に大金をかける",
    body: "中国ではグッズのぬいぐるみを購入後、大金をかけてぬいぐるみを自分の理想の形に整えることに夢中する若者が増えている。ぬいぐるみに「目の間隔を変更」、「顔の毛並みを綺麗に」、「チークをつける」などの手術を加えて、SNSにbefore/afterをアップする。推し文化の進化系と言えるブームに注目したい。",
    images: [
      { url: "/images/image41.png", alt: "ぬいぐるみの「整形手術」に大金をかける" },
      { url: "/images/image53.png", alt: "ぬいぐるみの「整形手術」に大金をかける" },
    ],
    category: "Education & Youth",
    year: 2026,
    reference: "https://www.woshipm.com/it/6048513.html",
  },
  {
    id: 3,
    number: 3,
    title: "プラスチックを食べる微生物",
    body: "ハーバード大の研究チームは、埋立地などから“プラスチックを食べる”微生物を探索し、X-32と名付けた株を発見した。 この微生物は多様なプラスチックを数百年ではなく数日で分解し、水とCO2、バイオマスだけを残すことができる。 研究チームは2024年にColossal Biosciencesと組んでBreakingというスタートアップを立ち上げ、AIでX-32を解析しながら性能向上を図っており、将来は下水処理場やコンポスト施設でマイクロプラスチック除去に使われることを目指している。",
    images: [
      { url: "/images/image11.png", alt: "プラスチックを食べる微生物" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.heritagedaily.com/2024/04/microbe-x-32-is-the-plasticene-era-coming-to-an-end/151604",
  },
  {
    id: 4,
    number: 4,
    title: "オープンソースで、誰もが修理可能なミキサー「re:Mix」",
    body: "ベルリンのスタートアップ「Open Funk」は、自分で修理・アップグレードができ、長く使い続けられるミキサー「re:Mix」を開発。互換性が高く手に入りやすい部品を使うモジュラー設計や、設計図を無償公開し、修理を容易にするなどの特徴を持つ。通常専用品が多い食品を入れる容器も、家庭でよく使われているガラス瓶をそのまま使うことも可能だ。",
    images: [
      { url: "/images/image88.png", alt: "オープンソースで、誰もが修理可能なミキサー「re:Mix」" },
      { url: "/images/image5.png", alt: "オープンソースで、誰もが修理可能なミキサー「re:Mix」" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.openfunk.co/?srsltid=AfmBOooUF59VHP19cq39YbSlVYDZEqAHWFfrUCHssgralfZg-C4dPPDp",
  },
  {
    id: 5,
    number: 5,
    title: "高齢者の「終活」着物が若者に売れるトレンドに",
    body: "訪問理美容と美容室経営の滋賀県にある「プラスワン」社が、外出が難しい高齢者や障害者らの元を訪ねる際に、 「持っている着物を元気なうちに何とかしたい」とよく相談される。高齢者から着物を買い取って、リメイクし、1点ものをネットストアで販売。若者が成人式に着用して「カッコ良いと評判で最高だった」とＳＮＳで発信。香港や米国、英国、スペインなどからも注文が入るという。",
    images: [
      { url: "/images/image8.png", alt: "高齢者の「終活」着物が若者に売れるトレンドに" },
      { url: "/images/image1.png", alt: "高齢者の「終活」着物が若者に売れるトレンドに" },
    ],
    category: "Fashion & Materials",
    year: 2026,
    reference: "https://www.yomiuri.co.jp/local/kansai/news/20240206-OYO1T50039/",
  },
  {
    id: 6,
    number: 6,
    title: "作り手の手形を残せるHuman Touch衣類",
    body: "ドイツのHUMAN TOUCH社は、縫製時にあえて黒インクを手につけて衣服に手形を残すことで服を作る裏側に人がいることを伝える取り組みをしている。完全な機械化が難しい縫製技術を通し、労働者の存在と地位向上を訴える取り組みは労働環境を想像するきっかけにつながるか。",
    images: [
      { url: "/images/image6.png", alt: "作り手の手形を残せるHuman Touch衣類" },
      { url: "/images/image7.png", alt: "作り手の手形を残せるHuman Touch衣類" },
    ],
    category: "Fashion & Materials",
    year: 2026,
    reference: "https://www.humantouchclothing.com/",
  },
  {
    id: 7,
    number: 7,
    title: "地に還る靴allbirds",
    body: "Allbirdsは世界初のネットゼロシューズ「M0.0NSHOT」を発表。カーボンネガティブ素材の調達から製造、包装、輸送方法までビジネスモデルを完全に見直して、カーボンクレジットに頼らずに達成。使用後は土に還るため、消費者は環境へのダメージを気にせずに楽しむことができる。",
    images: [
      { url: "/images/image12.png", alt: "地に還る靴allbirds" },
    ],
    category: "Fashion & Materials",
    year: 2026,
    reference: "https://www.allbirds.com/",
  },
  {
    id: 8,
    number: 8,
    title: "生分解性素材で作られる日用品の普及",
    body: "Notpla社は淡水や肥料が要らずに育つ海藻から、自然分解できるパッケージを開発。使い捨て紙コップやフードパッケージの代替品として期待される。バイオディグレータブル（生物分解性）な素材を使ったプラスティック代替品の開発が進み、短期間で自然分解できる多様な消費財が生産されていく。",
    images: [
      { url: "/images/image2.png", alt: "生分解性素材で作られる日用品の普及" },
      { url: "/images/image77.png", alt: "生分解性素材で作られる日用品の普及" },
      { url: "/images/image20.png", alt: "生分解性素材で作られる日用品の普及" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.notpla.com/",
  },
  {
    id: 9,
    number: 9,
    title: "ペットボトルから3Dプリンタ用素材を再生",
    body: "アムステルダムのスタートアップ企業「Reflow」は、使用済みのペットボトルを3Dプリンター用素材として再生。廃棄物の排出を抑制しながら、ものづくりにも寄与するNew Plastics Economyを提唱。120本のペットボトルから1キロ分の素材ができるという。",
    images: [
      { url: "/images/image4.png", alt: "ペットボトルから3Dプリンタ用素材を再生" },
      { url: "/images/image14.png", alt: "ペットボトルから3Dプリンタ用素材を再生" },
    ],
    category: "Fashion & Materials",
    year: 2026,
    reference: "https://www.ptonline.com/blog/post/startup-turns-recycled-plastic-into-3d-printing-filament-",
  },
  {
    id: 10,
    number: 10,
    title: "持続可能な",
    body: "バイオベース繊維 2030年には主要な合成繊維はバイオベース化と高性能化、2040年以降では製造プロセスの高効率化やサステナビリティ向上などから、CO2排出量の削減かつ生分解性でたい肥化ができるため、廃棄物汚染の縮小へ貢献する。",
    images: [
      { url: "/images/image24.png", alt: "持続可能な" },
      { url: "/images/image86.png", alt: "持続可能な" },
    ],
    category: "Fashion & Materials",
    year: 2026,
    reference: "https://bio.news/agriculture/patagonia-launches-sweet-new-down-coat-made-with-bio-material/",
  },
  {
    id: 11,
    number: 11,
    title: "プロダクトの透明性で選ばれる時代に",
    body: "原材料からプロセス、労働者、CO2等、サプライチェーンの透明化がより強く求められるようになっている。例えばEverlaneのようなオンラインアパレルECプラットフォームは、販売する衣類のコスト構造や素材のトレーサビリティを開示するため、商品の販売活動の透明性を高め、消費者が選びやすい環境を提供している。",
    images: [
      { url: "/images/image10.png", alt: "プロダクトの透明性で選ばれる時代に" },
      { url: "/images/image17.png", alt: "プロダクトの透明性で選ばれる時代に" },
    ],
    category: "Fashion & Materials",
    year: 2026,
    reference: "https://www.everlane.com/pages/about",
  },
  {
    id: 12,
    number: 12,
    title: "サステナビリティについて大手アパレルが果たすべき義務は",
    body: "大手スポーツアパレルブランド「NIKE」が“分解して”完全にリサイクルできる未来型スニーカーを発表した。昨今大手アパレルでは再生可能なアイテムを展開しているが、捨てる時のコミュニケーションまでカスタマーと取れていない様子がうかがえる。片足に対して3つのパーツを接着剤を使わずに組み合わせて履くことができ、分解後はナイキのショップに届けることでリサイクル処理される仕組みになっている。",
    images: [
      { url: "/images/image16.png", alt: "サステナビリティについて大手アパレルが果たすべき義務は" },
    ],
    category: "Fashion & Materials",
    year: 2026,
    reference: "https://sustainablebrands.com/read/nike-circular-shoe-designed-disassembly-recyclability",
  },
  {
    id: 13,
    number: 13,
    title: "エコ不安症の時代",
    body: "研究者たちは、異常気象による生活の破綻から将来への不安まで、気候変動が世界の人々のメンタルヘルスに及ぼす影響に気付き始めている。 ケニアで6年間農業を営んでいたLaureen Wamaithaは、毎年、今年の畑はうまくいくだろうと期待していた。けれども毎年、作物は干ばつで枯れてしまい、その後の洪水で流されてしまった。楽観と喪失のサイクルは、彼女を絶えず不安にさせた。「常にあれこれ心配していたせいで、パニック発作を起こすような状況に陥ってしまいました」。彼女は、全ては気候変動のせいだと考えている。",
    images: [
      { url: "/images/image22.png", alt: "エコ不安症の時代" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.natureasia.com/ja-jp/ndigest/v21/n7/%E3%82%A8%E3%82%B3%E4%B8%8D%E5%AE%89%E7%97%87%E3%81%AE%E6%99%82%E4%BB%A3/126983",
  },
  {
    id: 14,
    number: 14,
    title: "欧州で広がるリペアカフェ文化",
    body: "2009年にオランダ・アムステルダムで始まった「Repair Café de Meevaart」にインスパイアを受けて、英国全土でもリペアカフェが文化運動として広がりをみせている。英国全土に約580のリペアカフェが存在し、ボランティアを主体として、テレビなど、さまざまなものの修理が行われている。廃棄物や二酸化炭素排出量の削減とともに、新たな雇用の創出も期待されている。",
    images: [
      { url: "/images/image19.png", alt: "欧州で広がるリペアカフェ文化" },
      { url: "/images/image13.png", alt: "欧州で広がるリペアカフェ文化" },
    ],
    category: "Circular Economy",
    year: 2026,
    reference: "https://www.theguardian.com/lifeandstyle/article/2024/jun/16/the-great-diy-revival-meet-the-people-wholl-try-to-fix-anything",
  },
  {
    id: 15,
    number: 15,
    title: "介護疲れを癒す宿泊サービス",
    body: "世界的な平均寿命の伸長、少子高齢化を背景に、家庭内の無給ケアワーカーに関する問題が深刻化する英国において、慈善団体「Carefree」が宿泊施設の空室を無料で開放するサービスの提供を開始した。",
    images: [
      { url: "/images/image15.png", alt: "介護疲れを癒す宿泊サービス" },
      { url: "/images/image40.png", alt: "介護疲れを癒す宿泊サービス" },
    ],
    category: "Health & Wellness",
    year: 2026,
    reference: "https://ideasforgood.jp/2022/05/30/carefree/",
  },
  {
    id: 16,
    number: 16,
    title: "衣服のIoT化",
    body: "グーグルのATAP(Advanced Technology and Projects)がLevi‘sと進める「Project Jacquard」は、衣服にデバイスを付与するプロジェクト。あらゆるものへのIoTが加速。 グーグルのATAPが進める「Project Jacquard」の目的は、地球上のすべての衣類と布に 電気伝導性を織り込み、人々をスクリーンから解放することである。",
    images: [
      { url: "/images/image18.png", alt: "衣服のIoT化" },
      { url: "/images/image21.png", alt: "衣服のIoT化" },
    ],
    category: "Fashion & Materials",
    year: 2026,
    reference: "http://global.levi.com/jacquard/jacquard-with-buy-link.html",
  },
  {
    id: 17,
    number: 17,
    title: "日本一マッチョが多い介護の会社",
    body: "女性が8割、平均年齢が50歳の介護現場では重労働で腰痛に悩まされる職員も少なくない。そんな中、愛知県の介護福祉施設グループ「ビジョナリー」は男性７割、平均年齢29歳。８時間の勤務時間のうち、２時間を仕事としてトレーニングに充てることができ、利用者は安心してマッチョに身を預けることができる。",
    images: [
      { url: "/images/image95.png", alt: "日本一マッチョが多い介護の会社" },
      { url: "/images/image79.png", alt: "日本一マッチョが多い介護の会社" },
    ],
    category: "Health & Wellness",
    year: 2026,
    reference: "https://www.minnanokaigo.com/news/pickup/no5/",
  },
  {
    id: 18,
    number: 18,
    title: "Neko Health",
    body: "Neko Healthは、全身スキャンと人工知能（AI）を使って数千万もの健康データを非侵襲的に収集・解析し、心血管疾患や皮膚がん、代謝異常などのリスクを早期に検出する予防医療サービス。結果は即時に確認でき、医師との個別相談付きで健康状態の把握と生活改善アドバイスが受けられます。「治療から予防へ」の医療パラダイム転換を目指し、スウェーデン発で欧州各地に展開しています。",
    images: [
      { url: "/images/image99.png", alt: "Neko Health" },
      { url: "/images/image27.png", alt: "Neko Health" },
    ],
    category: "Health & Wellness",
    year: 2026,
    reference: "https://www.nekohealth.com/se/en",
  },
  {
    id: 19,
    number: 19,
    title: "睡眠が新たなステイタスシンボルに",
    body: "文化的に、過重労働を称賛する姿勢から健康を重視する姿勢へと移行するにつれ、睡眠は新たなステータス シンボルとなっている。以前は、「ハッスル」文化が長時間労働と犠牲を称賛し、睡眠を犠牲にすることが多かったが、睡眠が健康に重要な役割を果たすという認識が高まり、変化。特に著名人や専門家が睡眠は成功に不可欠であると支持し、睡眠経済の台頭を後押ししている。良質な睡眠をとる事こそが、セルフケアへの取り組みの表れとして、成功した生活を意味するシンボルとなりはじめている。",
    images: [
      { url: "/images/image28.png", alt: "睡眠が新たなステイタスシンボルに" },
      { url: "/images/image25.png", alt: "睡眠が新たなステイタスシンボルに" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://gendai.media/articles/-/150445?page=3",
  },
  {
    id: 20,
    number: 20,
    title: "老いにまつわる用語をアップデートするThe Aging Index",
    body: "2024年、アメリカの長寿ケア企業「Modern Age」が、老いに対するネガティブなイメージを変えるため、老いに関する用語のアップデートを提唱するキャンペーンを実施。意味のイノベーションで、社会的偏見の解消を目指す興味深い取り組みだ。Modern Ageの調査によると、75％以上の回答者が「老いることを恐れている」と答えたという。このキャンペーンは、そんな老化への恐怖を克服し、受け入れることができる社会へのアップデートを目指している。",
    images: [
      { url: "/images/image26.png", alt: "老いにまつわる用語をアップデートするThe Aging Index" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://ideasforgood.jp/2024/08/26/aging-index/",
  },
  {
    id: 21,
    number: 21,
    title: "メンタルヘルスの治療を目指すビデオゲーム",
    body: "Deepwellは、医療機器の専門家とチームを組み、健康状態の治療に役立つように特別に設計されたゲームを制作。ゲームは、特に医療の多くの未整備分野の 1 つであるメンタルヘルス治療に一定の関与と実際の治療効果をもたらす。自己実現、バイオフィードバック、主体性、ロールプレイを通じて、人々が異なる方法で考え、行動できるようにし、神経可塑性の向上によって新しいスキルの習得を加速することができるよう設計されている。",
    images: [
      { url: "/images/image48.png", alt: "メンタルヘルスの治療を目指すビデオゲーム" },
      { url: "/images/image56.png", alt: "メンタルヘルスの治療を目指すビデオゲーム" },
    ],
    category: "Health & Wellness",
    year: 2026,
    reference: "https://www.deepwelldtx.com/",
  },
  {
    id: 22,
    number: 22,
    title: "脳を鍛えるマインドフルネス・ヘッドバンド",
    body: "脳の状態を計測するヘッドバンド「Focus Calm」は、脳波を計測し、ストレス軽減やウェルビーイングのための瞑想プログラムやトレーニングを提供。Focus Calmは、AIアルゴリズムで脳波信号を1250のデータ点に基づいて測定し、ストレスレベルをリアルタイムで測定。東京にて行われたイベントでは、脳波買取機を設置して脳波を買取、脳波データによって描かれた脳波絵画を展示。",
    images: [
      { url: "/images/image30.png", alt: "脳を鍛えるマインドフルネス・ヘッドバンド" },
      { url: "/images/image31.png", alt: "脳を鍛えるマインドフルネス・ヘッドバンド" },
      { url: "/images/image29.png", alt: "脳を鍛えるマインドフルネス・ヘッドバンド" },
    ],
    category: "Health & Wellness",
    year: 2026,
    reference: "https://venesis.media/culture/life-culture/302120/",
  },
  {
    id: 23,
    number: 23,
    title: "極端な見える化の弊害",
    body: "MRやAIなどのテクノロジーの進化と普及によって、今まで「感」で測られたことが徹底的に見える化されることになる。それによる楽しさ、公平性、効率向上、そして新たなストレスが我々の日常になっていく。見えること、診断されることによって芽生える新たなストレスは我々の生活に必要以上の情報過多をもたらすことも実証されている。 i 声や表情からストレスや疲れを感じとって可視化",
    images: [
      { url: "/images/image47.png", alt: "極端な見える化の弊害" },
      { url: "/images/image44.png", alt: "極端な見える化の弊害" },
    ],
    category: "Technology",
    year: 2026,
    reference: "https://www.moguravr.com/spatial-vacuuming-demo/",
  },
  {
    id: 24,
    number: 24,
    title: "多様化する癒し商品",
    body: "特に若年層の男性を中心に飲酒量が減っているのに対し、GABAや大麻由来のCBD等のリラックス成分を使った食品や､サウナのようなアクティビティのように、女性と比べてセルフケアの手段が少ない男性も導入できる癒しの手段が増加している。",
    images: [
      { url: "/images/image32.png", alt: "多様化する癒し商品" },
      { url: "/images/image54.png", alt: "多様化する癒し商品" },
    ],
    category: "Food & Agriculture",
    year: 2026,
  },
  {
    id: 25,
    number: 25,
    title: "ダイナミクス・",
    body: "デート スポーツイベントなどの社交場がデートのための主要な場として注目されている。オンラインデートの表面的なやりとりとは対照的に、コミュニティ内での交流は、友情、競争が交錯する中で、自然でロマンチックな出会いをもたらす。恋愛は社会的ダイナミクスの中の摩擦が重要なのかもしれない。",
    images: [
      { url: "/images/image35.png", alt: "ダイナミクス・" },
      { url: "/images/image34.png", alt: "ダイナミクス・" },
    ],
    category: "Culture & Society",
    year: 2026,
    reference: "https://www.wellandgood.com/run-clubs-for-dating//",
  },
  {
    id: 26,
    number: 26,
    title: "開発競争が過熱する完全栄養食",
    body: "人が活生きるために必要な栄養素を全て含む、完全栄養食を提供する企業が増えている。多様なニーズを一気に取り込むことができ、健康志向の拡大などからグローバルで市場が拡大。例えばSoylent。2013年シリコンバレーで24歳の青年が立ち上げたスタートアップ。「生存に必要な栄養素がすべて含まれ、従来の食事が不要となる」とされる飲み物である。",
    images: [
      { url: "/images/image33.png", alt: "開発競争が過熱する完全栄養食" },
      { url: "/images/image36.png", alt: "開発競争が過熱する完全栄養食" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://soylent.com/",
  },
  {
    id: 27,
    number: 27,
    title: "3Dプリントされたパーソナライズドヘルスケア",
    body: "UKのNourishedはパーソナルウエルネスをとことん追求している。特許申請済みの3Dプリンターで7層に分かれたグミキャンディーを組成する。個人の健康志向、要望、身体的必要性に応じて個人に最適化されたビタミン、養分を混ぜ合わせ、吸収しやすい一口サイズの栄養剤としてサービス提供している。",
    images: [
      { url: "/images/image37.png", alt: "3Dプリントされたパーソナライズドヘルスケア" },
      { url: "/images/image42.png", alt: "3Dプリントされたパーソナライズドヘルスケア" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://get-nourished.com/en-jp#",
  },
  {
    id: 28,
    number: 28,
    title: "無欲と欲求の間でビジネスをする食品市場",
    body: "2030年までにアメリカの人口の約9%が体重減少薬を服用することになると予測される。ネスレは、 GLP-1体重減少薬の利用者向けに、タンパク質と食物繊維が豊富の新しい冷凍食品ブランドVital Pursuitをリリース。 高炭水化物食品に食欲を失う新しい消費者層に対して新たなアプローチを試みる。",
    images: [
      { url: "/images/image87.png", alt: "無欲と欲求の間でビジネスをする食品市場" },
      { url: "/images/image93.png", alt: "無欲と欲求の間でビジネスをする食品市場" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://edition.cnn.com/2024/05/21/food/nestle-glp-1-food-vital-proteins/index.html",
  },
  {
    id: 29,
    number: 29,
    title: "食のデータ化によるフードプリンティング",
    body: "OPENMEALS構想は、あらゆる料理をデータ化し、世界中にシェアできる”食のオープンプラットフォーム”を構築する取り組み。",
    images: [
      { url: "/images/image38.png", alt: "食のデータ化によるフードプリンティング" },
      { url: "/images/image39.png", alt: "食のデータ化によるフードプリンティング" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.open-meals.com/",
  },
  {
    id: 30,
    number: 30,
    title: "ビルゲイツも出資した成果物の劣化を遅らせる特殊素材Apeel",
    body: "米国の「Apeel Sciences（アピール・サイエンシーズ）」は、野菜や果物に表面にコーティングすることで鮮度を長持ちさせる素材を開発。食品ロス削減につながる技術となりうるか。 米カリフォルニア州の「Apeel Sciences（アピール・サイエンシーズ）」は、野菜や果物の表面にコーティングすることにより、内部の水分を閉じ込めながら、外気を遮断し、水分の蒸散と酸化を遅らせることで、鮮度を従来よりも2倍から3倍長く保持できる特殊素材「Apeel（アピール）」を開発した。防腐剤を使わず、冷蔵や湿度管理も必要とせず、高い品質を長期間保持できることから、長距離の輸送にも耐え、より遠方の消費者にも新鮮な状態で青果物を届けることができる。",
    images: [
      { url: "/images/image91.png", alt: "ビルゲイツも出資した成果物の劣化を遅らせる特殊素材Apeel" },
      { url: "/images/image50.png", alt: "ビルゲイツも出資した成果物の劣化を遅らせる特殊素材Apeel" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://apeel.com/products",
  },
  {
    id: 31,
    number: 31,
    title: "カプセルで売るカスタムスパイス",
    body: "Occoのスパイスポッドは密封された半ティースプーン分で、計量済みかつ超新鮮。レシピキットで正確なスパイス量を、スパイスカードで気軽に新鮮な風味を楽しめます。スパイスとレシピをセットで販売し、生活提案に取り組んでいます。自分の身体やライフスタイルにあった調合を自分で楽しみたい、挑戦したいという思考性にあった商品となっている。",
    images: [
      { url: "/images/image43.png", alt: "カプセルで売るカスタムスパイス" },
      { url: "/images/image46.png", alt: "カプセルで売るカスタムスパイス" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.eatocco.com",
  },
  {
    id: 32,
    number: 32,
    title: "オレンジやキノコが服飾素材に",
    body: "サーキュラーエコノミーを実現する新素材として、食品関連廃棄物由来の素材を使ったファッションが開発されている。ロンドンに本社を置くAnanas Anam社は、パイナップルの葉の繊維から作られたレザーを開発。 イタリア・シチリア島のOrange Fiber社は、オレンジジュースを生産する際の廃棄物を使ったシルクのような布地を製造。米国・カリフォルニアのMyvoWorks社は、キノコの菌糸から高品質レザーと同じような耐久性や柔軟性を備えた素材を開発。",
    images: [
      { url: "/images/image45.png", alt: "オレンジやキノコが服飾素材に" },
      { url: "/images/image49.png", alt: "オレンジやキノコが服飾素材に" },
      { url: "/images/image51.png", alt: "オレンジやキノコが服飾素材に" },
      { url: "/images/image52.png", alt: "オレンジやキノコが服飾素材に" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.ananas-anam.com/",
  },
  {
    id: 33,
    number: 33,
    title: "「メトロファーム」地下鉄の駅で野菜を栽培・販売",
    body: "韓国では、ソウル市内の5つの地下鉄の駅で、コロナで地下鉄の利用者が減ったことによりテナントが撤退することが多かったので、その場所を農園として利用した「メトロファーム（Metro Farm：메트로팜）」を開設。コロナ禍のテナント撤退によりできた空きスペースを有効活用するために、地下鉄を運営する「ソウル交通公社」と植物工場専門会社の「Farm8」が協力してオープンしたのが「メトロファーム」であり、天候に影響を受けずに一定の費用で栽培できる環境になっている。また完全に囲われた環境での栽培なので害虫被害もなく、無農薬野菜を育てることが可能である。",
    images: [
      { url: "/images/image55.png", alt: "「メトロファーム」地下鉄の駅で野菜を栽培・販売" },
      { url: "/images/image57.png", alt: "「メトロファーム」地下鉄の駅で野菜を栽培・販売" },
      { url: "/images/image58.png", alt: "「メトロファーム」地下鉄の駅で野菜を栽培・販売" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://venesis.media/culture/life-culture/302120/",
  },
  {
    id: 34,
    number: 34,
    title: "AIで好まれる味のスナック開発:無印良品",
    body: "無印良品は主流SNS「微博（ウェイボ）」「小紅書」などに書き込まれた味の好みやレシピなどに関する膨大なデータを解析。AIが3兆回の計算を繰り返し、人々が好む3種類の味にたどり着いたという。",
    images: [
      { url: "/images/image65.png", alt: "AIで好まれる味のスナック開発:無印良品" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.tokyo-np.co.jp/article/307223",
  },
  {
    id: 35,
    number: 35,
    title: "世界初カーボンニュートラルなチーズ",
    body: "製造過程における徹底した環境配慮のもと、英国・サマセットのチーズメーカーWyke Farmsは、世界初のカーボンニュートラル認証を受けたチェダーチーズ「Ivy’s Reserve Vintage Cheddar」を製造している。Wyke Farmsでは、2010年から農場のグリーン化を進めており、CO2排出量削減のため、飼料、土地管理、エネルギー利用、再生農業、土壌保護の持続可能性計画とインセンティブプログラムを実施している。",
    images: [
      { url: "/images/image59.png", alt: "世界初カーボンニュートラルなチーズ" },
      { url: "/images/image62.png", alt: "世界初カーボンニュートラルなチーズ" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.ivys-reserve.com/our-range/ivys-reserve-vintage-cheddar/cheddar",
  },
  {
    id: 36,
    number: 36,
    title: "IoT農園が実現するアーバンファーミング",
    body: "プランティオの「grow」は、家庭のべランダやビルの屋上、マンション内などで行う“農”をDX化するアーバンファーミングを推進。IoTセンサーでプランターや菜園などのデータを可視化できるほか、東京都内にシェアリング農園なども設置し、都市農園の展開によるコレクティブインパクト（社会課題へのアプローチ）を図っている。",
    images: [
      { url: "/images/image83.png", alt: "IoT農園が実現するアーバンファーミング" },
      { url: "/images/image61.png", alt: "IoT農園が実現するアーバンファーミング" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://grow-agritainment.com/",
  },
  {
    id: 37,
    number: 37,
    title: "「食料主権」(Food Sovereignty)が再定義するフードシステム",
    body: "食料生産や流通の主権はグローバル資本ではなく、ローカルの食料生産者が持つべきと強調する「食料主権」（Food Sovereignty）の運動が再び注目を集めている。グローバスサウスでは、遺伝子組み換えを含めた品種改良の種子を巨大グローバル企業から買ってしまったが最後、種子に反応のいい高価な化学肥料や農薬を同じ企業から買い続ける依存状態に陥り、土地の生態系を失い、さらなる貧困のスパイラルに転落する事態が後を絶たない。",
    images: [
      { url: "/images/image60.png", alt: "「食料主権」(Food Sovereignty)が再定義するフードシステム" },
      { url: "/images/image63.png", alt: "「食料主権」(Food Sovereignty)が再定義するフードシステム" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://unu.edu/conversation-series/food-systems-africa-role-food-sovereignty-promoting-sustainable-development",
  },
  {
    id: 38,
    number: 38,
    title: "ゴミの最終処分場の限界まであと20年ほど",
    body: "Z世代が主体で始まったごみ問題を考えるソーシャルプロジェクト 「530ACTION」は、2030年までに「ごみ」の概念がない社会を目指し、生活者の意識と行動改革にチャレンジすることを目的としており、同世代のインフルエンサーをはじめ、他の世代までも巻き込む形でムーブメントを起こしている。",
    images: [
      { url: "/images/image69.png", alt: "ゴミの最終処分場の限界まであと20年ほど" },
      { url: "/images/image67.png", alt: "ゴミの最終処分場の限界まであと20年ほど" },
    ],
    category: "Circular Economy",
    year: 2026,
    reference: "https://530action.jp/",
  },
  {
    id: 39,
    number: 39,
    title: "コンポストでつながる食と農の",
    body: "プラットフォーム 「CSA LOOP」は生産者と消費者がつながるCSA（地域支援型農業）とコンポストの概念を掛け合わせた循環の仕組み。消費者は1年分の野菜の代金を前払いすることでユーザーとなり、受け渡し拠点となる地域のカフェやファーマーズマーケットなどで、定期的に農家から野菜を直接受け取る。自宅でコンポストをしている人は、コンポストの土を農家に渡すこともできる。農家とユーザーは畑での農業体験やオンラインのチャットなどで交流を深めることができる。",
    images: [
      { url: "/images/image64.png", alt: "コンポストでつながる食と農の" },
      { url: "/images/image66.png", alt: "コンポストでつながる食と農の" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://4nature.co.jp/csaloop/",
  },
  {
    id: 40,
    number: 40,
    title: "みんなに開かれた工場",
    body: "「工場を開く」ことで、企業と地域とのつながりの構築、ものづくりの風景を見ながら子供が育つことで働くことや暮らしをより豊かにする学びや気づきを創出することにもつながると思料（＝遊びながら自然に学ぶことの実現）。働く人にとっても、ここで働くことが誇りになる可能性も。",
    images: [
      { url: "/images/image68.png", alt: "みんなに開かれた工場" },
      { url: "/images/image70.png", alt: "みんなに開かれた工場" },
      { url: "/images/image89.png", alt: "みんなに開かれた工場" },
    ],
    category: "Education & Youth",
    year: 2026,
    reference: "https://factory.shiro-shiro.jp/",
  },
  {
    id: 41,
    number: 41,
    title: "キノコが家屋を分解 : 汚染を浄化する菌類の活用法",
    body: "クリーブランド市では、放置された家屋が急増するという問題に直面している。これらの建物は鉛などの有害物質に汚染され、修復不可能なほど老朽化している。解体によって発生する膨大な量の有害廃材をどう処理するのかが課題となっている。「解体から出るすべての資材（柱、床材、セルロース系の素材、天井タイル、アスファルト）は、キノコを育てる基質に混ぜることができる」と説明されている。基質とは、菌糸体（キノコ）が廃屋から出る有害廃棄物を分解するために使われる材料のことである。成長したキノコは重金属やその他の毒素を吸収し、基質の残り部分と菌糸体は圧縮・加熱され、再建築用のクリーンなレンガへと生まれ変わる。",
    images: [
      { url: "/images/image74.png", alt: "キノコが家屋を分解 : 汚染を浄化する菌類の活用法" },
      { url: "/images/image71.png", alt: "キノコが家屋を分解 : 汚染を浄化する菌類の活用法" },
    ],
    category: "Fashion & Materials",
    year: 2026,
    reference: "https://www.bbc.com/future/article/20240314-fungi-can-be-used-to-clean-pollution-and-combat-climate-change",
  },
  {
    id: 42,
    number: 42,
    title: "優秀なテック人材候補にfuture meatballを食べさせるIKEA",
    body: "IKEAは年間1,000,000,000のミートボールが消費される。1秒に30個だ。畜産と食肉加工は直接的な環境汚染に影響をもたらす。一方でIKEAのデジタル化が急ピッチで進む中、最優秀テック人材の獲得が永続的な課題となっている。テック人材を採用面接のランチに招待し、IKEAの代表的なスウェーデンメニューを提供するのだが、感触間際に実はミートボールが3Dプリントされた大豆由来の商品だったことが明かされる。",
    images: [
      { url: "/images/image80.png", alt: "優秀なテック人材候補にfuture meatballを食べさせるIKEA" },
      { url: "/images/image72.png", alt: "優秀なテック人材候補にfuture meatballを食べさせるIKEA" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.ikea.com/global/en/stories/ikea-around-the-world/people-planet/3d-meatballs-230509/",
  },
  {
    id: 43,
    number: 43,
    title: "自立生産型ネットワークによる建築のオンデマンドサービス",
    body: "地域の木材を利用した環境負荷の少ない住まいをデジタルテクノロジーを用いて自分たちで設計して作り出すためのプラットフォーム。国内100拠点にCNCルーターを設置。伐採から加工までを半径10km圏内で完結させることで、川上の生産者と川下のエンドユーザーを直接つなぐ。",
    images: [
      { url: "/images/image78.png", alt: "自立生産型ネットワークによる建築のオンデマンドサービス" },
      { url: "/images/image73.png", alt: "自立生産型ネットワークによる建築のオンデマンドサービス" },
    ],
    category: "Technology",
    year: 2026,
    reference: "https://shopbot.vuild.co.jp/news/posts/hud5bFsS",
  },
  {
    id: 44,
    number: 44,
    title: "動きがエネルギーに変わる、ウェアラブルレギンス",
    body: "体の動きで発生する自然な電気エネルギーを利用し、導電性繊維を通じて筋肉に微電流を送るウェアラブルテクノロジー。バッテリーやワイヤーを使わず、持続可能で環境に優しい健康・ウェルネスソリューションを提供。",
    images: [
      { url: "/images/image76.png", alt: "動きがエネルギーに変わる、ウェアラブルレギンス" },
      { url: "/images/image75.png", alt: "動きがエネルギーに変わる、ウェアラブルレギンス" },
    ],
    category: "Fashion & Materials",
    year: 2026,
    reference: "https://hyvle.com/",
  },
  {
    id: 45,
    number: 45,
    title: "子守り支援ロボットで親と赤ちゃん双方の顧客体験を向上",
    body: "日産とアカチャンホンポが協業して作った運転中の子守り支援ロボットのコンセプトモデル。運転中、子どもに注視できず不安な親と親に構ってもらえずに不安を抱える子どもそれぞれのペインを解決することが目的。新たな車内体験を考える上で、ロボットも含めたインタラクションが重要になるかもしれない。",
    images: [
      { url: "/images/image97.png", alt: "子守り支援ロボットで親と赤ちゃん双方の顧客体験を向上" },
      { url: "/images/image96.png", alt: "子守り支援ロボットで親と赤ちゃん双方の顧客体験を向上" },
    ],
    category: "Health & Wellness",
    year: 2026,
    reference: "https://prtimes.jp/main/html/rd/p/000000419.000018863.html",
  },
  {
    id: 46,
    number: 46,
    title: "AI玩具が子供の遊び方を決める",
    body: "イギリスのデザイン会社morranaが開発した子供向けAI玩具は、子供の精神面のサポートを目的に、玩具にセンサーを組み込んでストレスレベルを探知し、連動する別の玩具での遊び方を提案する。AIと一緒に遊ぶことが当たり前になるAIネイティブの子供は、全ての意思決定をAIとともに行うようになるのか。",
    images: [
      { url: "/images/image141.png", alt: "AI玩具が子供の遊び方を決める" },
      { url: "/images/image104.png", alt: "AI玩具が子供の遊び方を決める" },
    ],
    category: "Education & Youth",
    year: 2026,
    reference: "https://www.designboom.com/technology/morrama-ai-tools-children-mental-health-07-16-2024/",
  },
  {
    id: 47,
    number: 47,
    title: "何でもありの人間拡張スポーツ大会",
    body: "PayPalの共同設立者であるピーターティール他ベンチャーキャピタリストたちが創設した「Enhanced games」はアスリートによるドーピングや禁止技術/道具を正式に認め、人間の限界を押し広げることが目的としている。普及すると一般社会においてもリスクを冒してでも能力を向上させる風潮が広まる危険性があるなど、賛否が残る。",
    images: [
      { url: "/images/image81.png", alt: "何でもありの人間拡張スポーツ大会" },
    ],
    category: "Culture & Society",
    year: 2026,
    reference: "https://enhanced.org/",
  },
  {
    id: 48,
    number: 48,
    title: "目玉をスキャンして暗号資産をもらう",
    body: "ChatGPTの開発元のOpenAIのサム・アルトマンCEOが立ち上げたWorldcoinは眼球のデジタルスキャン応じた人々に約60ドル相当の暗号資産を与えている。スキャンに使う専門機械「Orb」 は目のスキャンをハッシュとして知られる独自の数値文字列に変換し、虹彩ハッシュとユーザーの公開鍵のハッシュの両方を会社のデータベースに送信し、ブロックチェーンに統合。",
    images: [
      { url: "/images/image94.png", alt: "目玉をスキャンして暗号資産をもらう" },
      { url: "/images/image115.png", alt: "目玉をスキャンして暗号資産をもらう" },
    ],
    category: "Technology",
    year: 2026,
    reference: "https://world.org/ja-jp",
  },
  {
    id: 49,
    number: 49,
    title: "カスタマイズ度が高いデバイスがQOLを高める",
    body: "舌を使ってPCの操作ができるコントローラー”MouthPad^”をMITのスタートアップAugmentalが開発している。今まで画一的な形だったものが、身体状況に合わせたカスタマイズ可能になると、コントローラーやデバイスに依存しないユーザーの体験設計が求められるのでは。",
    images: [
      { url: "/images/image84.png", alt: "カスタマイズ度が高いデバイスがQOLを高める" },
      { url: "/images/image82.png", alt: "カスタマイズ度が高いデバイスがQOLを高める" },
    ],
    category: "Technology",
    year: 2026,
    reference: "https://wired.jp/article/augmental-mouthpad/",
  },
  {
    id: 50,
    number: 50,
    title: "4Dプリンティングで変わる「製造」の概念",
    body: "4Dプリンティングは、3Dプリンティング技術を基にして、時間の経過とともに形状や機能が変化するオブジェクトを作り出す技術。東京大学の研究チームは熱収縮性のシートに折紙のパターンを印刷する技術を開発し、瞬時に複雑な折紙の形状を自動で変形させることに成功。",
    images: [
      { url: "/images/image111.png", alt: "4Dプリンティングで変わる「製造」の概念" },
      { url: "/images/image100.png", alt: "4Dプリンティングで変わる「製造」の概念" },
    ],
    category: "Technology",
    year: 2026,
    reference: "https://idarts.co.jp/3dp/tokyo-university-new-4d-printing-method/",
  },
  {
    id: 51,
    number: 51,
    title: "テクノロジーとの新しい触れ合い方を作るスマートデバイス",
    body: "mui Labは、「カーム・テクノロジー 」を軸としたデザインと技術を通じて、人の心にいつでも寄り添うデジタルテクノロジーを普及させるIoTスタートアップ。カーム・テクノロジー（穏やかなテクノロジー）の理念を実装した天然木のコミュニケーション・ボードを開発。手書きやボイスメッセージ機能を備え、家族の軌跡を時間を超えて追体験することができる。テーブルを拭くと、照明に明かりが灯される。モノと人のダイレクトなつながりに留まらず、空間までインタラクションの領域を広げ、人の日常的な身体動作を組み込み、家具や道具がアプリケーションとして振る舞う。",
    images: [
      { url: "/images/image85.png", alt: "テクノロジーとの新しい触れ合い方を作るスマートデバイス" },
      { url: "/images/image136.png", alt: "テクノロジーとの新しい触れ合い方を作るスマートデバイス" },
    ],
    category: "Technology",
    year: 2026,
    reference: "https://muilab.com/ja/",
  },
  {
    id: 52,
    number: 52,
    title: "デジタル弱者をサポートする電話ボックス",
    body: "椅子と大きなスクリーンを提供するスマート電話ボックス。市民が無料で通話できる電話機だけでなく、高齢者向けの新しいインテリジェント情報画面も設置され、ワンクリックでのタクシー呼び出し、手話接客、年金保険に関する問い合わせ、携帯電話の充電などの機能が充実している。",
    images: [
      { url: "/images/image113.png", alt: "デジタル弱者をサポートする電話ボックス" },
      { url: "/images/image90.png", alt: "デジタル弱者をサポートする電話ボックス" },
    ],
    category: "Signals",
    year: 2026,
    reference: "https://www.shmh.gov.cn/shmh/xyw/20230522/555889.html",
  },
  {
    id: 53,
    number: 53,
    title: "デジタル機器はお断りのオフライン・カフェ",
    body: "オランダ・アムステルダムの「Cafe Brecht」では、The Offline Clubというコミュニティによる“オフライン”イベントが開催され、注目されている。参加者たちは、約２時間のイベント中、デジタルデバイスの通知や新着情報から距離を取り、リラックスした雰囲気の中で、自然と会話が起きたり、アイデア交換をしたりなど、アナログなつながりを育んでいるという。",
    images: [
      { url: "/images/image199.png", alt: "デジタル機器はお断りのオフライン・カフェ" },
      { url: "/images/image187.png", alt: "デジタル機器はお断りのオフライン・カフェ" },
      { url: "/images/image126.png", alt: "デジタル機器はお断りのオフライン・カフェ" },
    ],
    category: "Technology",
    year: 2026,
    reference: "https://ideasforgood.jp/2024/03/26/the-offline-club/",
  },
  {
    id: 54,
    number: 54,
    title: "未来の仕事のスキルを学べる高専",
    body: "アメリカでは高専への注目が高まっている。フロリダ州タンパにある公立高校Kirkland Ranch Academy of Innovationは、実社会の課題解決に紐づくスキル・マインドセットを習得する教育機関として人気を博している。特にタンパ地域において集積度の高いロボティクス、ヘルスケア、建設などの領域における、未来の仕事に必要な教育機会を提供しており、領域横断的な共創や創造性に重きを置くことで、「閉じない専門性」の強化を図りながら、FUTURE READYな人材創出に取り組んでいる。",
    images: [
      { url: "/images/image132.png", alt: "未来の仕事のスキルを学べる高専" },
      { url: "/images/image122.png", alt: "未来の仕事のスキルを学べる高専" },
    ],
    category: "Health & Wellness",
    year: 2026,
    reference: "https://krai.pasco.k12.fl.us/",
    focalHint: "50% 85%",
  },
  {
    id: 55,
    number: 55,
    title: "米国で高まるブルーカラー職への関心",
    body: "米国ではパンデミック時代の政策 - 低賃金労働者の賃金を改善し、雇用の流動性と改善を促した - を機に、ブルーカラー職への待遇が向上。またTikTokではロブスター漁師や羊飼いなど珍しいブルーカラーワーカーが多くのフォロワーを獲得しており、就職先として若者の関心が集まっている。AI技術の台頭により、手に職を備え、淘汰されないキャリアを模索する若者も増えている。",
    images: [
      { url: "/images/image92.png", alt: "米国で高まるブルーカラー職への関心" },
    ],
    category: "Education & Youth",
    year: 2026,
    reference: "http://www.instagram.com",
  },
  {
    id: 56,
    number: 56,
    title: "人間の行動傾向を観察し、再現するAI",
    body: "Rabbit OSは大規模言語モデル（LLM）に大規模アクションモデル（LAM）を加えたアシスタントシステム。 LAMはユーザーの意図を理解し、さらにモバイル、デスクトップ、クラウドのインターフェイスを通じて人間がどのようにタスクを実行するかを観察し、そのタスクを実際に再現できる。",
    images: [
      { url: "/images/image103.png", alt: "人間の行動傾向を観察し、再現するAI" },
      { url: "/images/image110.png", alt: "人間の行動傾向を観察し、再現するAI" },
    ],
    category: "Technology",
    year: 2026,
    reference: "https://www.rabbit.tech/creations",
  },
  {
    id: 57,
    number: 57,
    title: "AIにデータを提供して小遣い稼ぎ",
    body: "アメリカのアドビが、文章から動画を生成するAIモデルの構築に向けて動画コンテンツの収集を開始した。報酬は投稿動画１分当たり2.62ドル程度が平均だが、最高7.25ドル程度になる可能性もあるという。AI学習用のデータを提供したり、編集支援をしたりするなど、ユーザーはライフログを丸ごと提供して、企業からベーシックインカムを得ることが起こるかもしれない。",
    images: [
      { url: "/images/image101.png", alt: "AIにデータを提供して小遣い稼ぎ" },
      { url: "/images/image102.png", alt: "AIにデータを提供して小遣い稼ぎ" },
    ],
    category: "Technology",
    year: 2026,
    reference: "https://www.bloomberg.co.jp/news/articles/2024-04-11/SBR0HIT0G1KW00",
  },
  {
    id: 58,
    number: 58,
    title: "AIの台頭により社内外の人材の共創がさらに加速",
    body: "生成AI台頭の波と、ギグワーカーの拡大の波が押し寄せることで、組織形態が変わりつつある。大企業が苦手とする生成AIを活用した創出業務はもはや社内リソースで推進することが難しくなっており、コロナ禍によるギグワークの浸透は、希少能力・専門性を持つ人材を世に放出することになった。社内の少数の人材と、社外の希少人材をコアとするアメーバ的な”blended teams”は創造的な業務を加速させる。",
    images: [
      { url: "/images/image98.png", alt: "AIの台頭により社内外の人材の共創がさらに加速" },
    ],
    category: "Technology",
    year: 2026,
    reference: "https://www.fastcompany.com/91196922/two-big-future-of-work-trends-are-about-to-collide",
    focalHint: "contain",
  },
  {
    id: 59,
    number: 59,
    title: "デジタルヒューマンが働く主役に、会社の無人化",
    body: "自分の3-5分の動画をアップロードするだけで、動く、喋る、自分とそっくりなデジタルヒューマンを作ることができる。デジタルヒューマンを利用したライブコマースがすでに中国で実用され、今後教育、営業、カスタマーサービスなど、人の姿が主体になるシーンでの活用が期待できる。",
    images: [
      { url: "/images/image160.png", alt: "デジタルヒューマンが働く主役に、会社の無人化" },
      { url: "/images/image112.png", alt: "デジタルヒューマンが働く主役に、会社の無人化" },
      { url: "/images/image178.png", alt: "デジタルヒューマンが働く主役に、会社の無人化" },
    ],
    category: "Education & Youth",
    year: 2026,
    reference: "https://zhuanlan.zhihu.com/p/629229155",
  },
  {
    id: 60,
    number: 60,
    title: "AIカメラの限界：Amazonが「Just Walk Out」を廃止",
    body: "店から商品を持ち出すだけで自動的に決済できるAmazonのサービス「Just Walk Out」は、実はインドにある1000人のチームが顧客の動きを監視してAIモデルをトレーニングしていた。その膨大なコストが廃止となる原因。今後は顧客に商品のスキャンを任せる「Dash Cart」が採用される見込み。買い物一つとっても人の行動は複雑であり、ルールベースのアルゴリズムでは行動理解の限界があることも示唆されている。",
    images: [
      { url: "/images/image139.png", alt: "AIカメラの限界：Amazonが「Just Walk Out」を廃止" },
      { url: "/images/image145.png", alt: "AIカメラの限界：Amazonが「Just Walk Out」を廃止" },
    ],
    category: "Technology",
    year: 2026,
  },
  {
    id: 61,
    number: 61,
    title: "万が一が起こる前に支払われる保険",
    body: "Parametric insuranceに注目が浴びている。災害による被害の確認、検証、書類申請、承認、支払いなど、従来の保険のモデルと異なり、高度な衛星とモニタリング技術により、降水量や風量などの事前に設定したパラメトリクスを計測し、被災したかどうかに関係なく即時給付される無条件補償の保険モデルを取っている。ルクセンブルグのIBISA社はミンダナオ島ベースのCLIMBS社と協力し、このようなco-op型の保険を気候変動の影響が受けやすく、かつ容易に保険会社のカバレッジが及ばないエリアにテスト展開しようとしている。",
    images: [
      { url: "/images/image106.png", alt: "万が一が起こる前に支払われる保険" },
    ],
    category: "Technology",
    year: 2026,
    reference: "https://www.fastcompany.com/91155414/parametric-insurance-farmers-facing-extreme-weather-climate-change",
  },
  {
    id: 62,
    number: 62,
    title: "近代のノアの箱舟",
    body: "北極海近くのノルウェー領スヴァールバル諸島最大の島であるスピッツベルゲン島のスヴァールバル世界種子貯蔵庫では、地球の未来のために種子を守るべく、5,000種を超える植物種を保管。地球滅亡に備えて、様々な種の存続を担保するために遺伝子情報を含む種子を保管している。月には気候変動の脅威がないため、種子保存に適した月への移管を計画中。",
    images: [
      { url: "/images/image105.png", alt: "近代のノアの箱舟" },
    ],
    category: "Energy & Climate",
    year: 2026,
    reference: "https://www.seedvault.no/",
  },
  {
    id: 63,
    number: 63,
    title: "Anyone Repairs It Anywhere",
    body: "オランダのアイントホーフェン工科大学の学生チームTU/ecomotiveが開発した電気自動車コンセプト「ARIA」は、「Anyone Repairs It Anywhere（誰でもどこでも直せる）」を掲げ、内蔵ツールボックスや診断アプリと標準化されたモジュール部品により、専門知識がなくてもユーザー自身がバッテリーやボディパネルなどを簡単に交換・修理できるよう設計された超軽量シティEVであり、EUの「修理する権利」を自動車分野にも拡張し得る新しい設計アプローチの実験的プロトタイプとして位置づけられている。",
    images: [
      { url: "/images/image114.png", alt: "Anyone Repairs It Anywhere" },
      { url: "/images/image109.png", alt: "Anyone Repairs It Anywhere" },
    ],
    category: "Circular Economy",
    year: 2026,
    reference: "https://www.dezeen.com/2026/01/02/aria-repairabe-electric-car-tu-ecomotive-group/",
  },
  {
    id: 64,
    number: 64,
    title: "カーボンフリーな",
    body: "ポリスチレン代替素材 農業廃棄物から生まれたカーボンネガティブ素材「Carbon Cell」は、発泡スチロールと同等の軽さと断熱性を持ちながら、完全プラスチックフリーで家庭用コンポストでも分解できる次世代フォームです。 既存のEPS設備で生産可能なためスケールしやすく、建築断熱材からパッケージング、音響パネル、インテリアまで幅広い応用が期待される、循環型デザインとマテリアル・イノベーションの好例として注目されている。",
    images: [
      { url: "/images/image107.png", alt: "カーボンフリーな" },
      { url: "/images/image108.png", alt: "カーボンフリーな" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.dezeen.com/2025/11/25/carbon-cell-plastic-free-polystyrene/",
  },
  {
    id: 65,
    number: 65,
    title: "「ウールテック」の",
    body: "台頭？ 英国の若手デザイナー、ヒンナ・カーンによる「WoolTech」は、羊毛にレーザー加工を施して導電パターンをつくり、従来の配線やプラスチック基板を置き換えることを目指す実験的エレクトロニクスプロジェクトです。 価値が低いとされ廃棄されてきた粗毛に新たな用途と収入源をもたらしつつ、単一素材・生分解性のハードウェアというアプローチで、電子ゴミと素材採掘の問題に挑んでいます。",
    images: [
      { url: "/images/image116.png", alt: "「ウールテック」の" },
      { url: "/images/image120.png", alt: "「ウールテック」の" },
    ],
    category: "Fashion & Materials",
    year: 2026,
    reference: "https://www.dezeen.com/2025/08/05/wooltech-electronics-hinna-khan/",
  },
  {
    id: 66,
    number: 66,
    title: "第2のふくらはぎを構築",
    body: "NikeとDephyが開発中の「Project Amplify」は、ふくらはぎの第二の筋肉のように働く電動アンクレット型デバイスで、モーターがかかとを持ち上げることで、一般ランナーのランやウォークをより速く・楽に・遠くまでサポートする新しいフットウェアシステムである。",
    images: [
      { url: "/images/image128.png", alt: "第2のふくらはぎを構築" },
    ],
    category: "Fashion & Materials",
    year: 2026,
    reference: "https://www.dezeen.com/2025/08/05/wooltech-electronics-hinna-khan/",
  },
  {
    id: 67,
    number: 67,
    title: "胚芽からの健康度を包括的に評価",
    body: "Juniper Genomics は、全ゲノム＋トランスクリプトーム（RNA）解析と、両親と胚の「トリオ解析」を組み合わせた次世代の着床前検査を提供している。北米20以上のクリニックで導入されており、従来のほぼすべての着床前遺伝学的検査を置き換えつつ、IVF失敗・流産・出生後の疾患リスクに関わる数千の追加バリアントも検出可能とされる。​トロント拠点の非公開企業で、今年450万ドルのシード資金を調達し、1胚あたり約2,000ドルの検査費用について保険適用を目指したパイロットも進行中と報じられている",
    images: [
      { url: "/images/image117.png", alt: "胚芽からの健康度を包括的に評価" },
      { url: "/images/image118.png", alt: "胚芽からの健康度を包括的に評価" },
    ],
    category: "Health & Wellness",
    year: 2026,
    reference: "https://www.junipergenomics.com/",
  },
  {
    id: 68,
    number: 68,
    title: "VRとテレビ活用で弱視対策",
    body: "弱視（いわゆる「なまけ眼」）は子どもの視力低下の主な原因で、全米で約100万人の子どもに影響しているとされる。従来は「よく見えるほうの目」にアイパッチを貼って弱いほうの目を鍛えるが、不快かつ見た目のストレスも大きい。これに対し Luminopia は、ボストン小児病院とMITと共同開発したVRヘッドセットを使い、1日1時間テレビ番組を視聴しながら両眼が協調して働くよう訓練するという、遊び感覚の治療法を提供している。このデバイスは12歳までの子どもを対象に承認を取得し、Anthem Blue Cross Blue Shield の保険適用も確保してアクセス拡大を進めてい",
    images: [
      { url: "/images/image123.png", alt: "VRとテレビ活用で弱視対策" },
      { url: "/images/image119.png", alt: "VRとテレビ活用で弱視対策" },
    ],
    category: "Technology",
    year: 2026,
    reference: "https://www.luminopia.com/",
  },
  {
    id: 69,
    number: 69,
    title: "UVライトによる「光レシピ」",
    body: "作物に短時間のUV照射を行い、成長特性を変化させる「光レシピ」によって、収量や栄養価を向上し、米などの耐乾燥・耐暑性も高める技術を開発。ハイブリッドコーン試験では収量58％増という結果が出ており、1回の処理で次世代種子にも効果が継承され、CRISPRなどの遺伝子編集より約90％安く速いとされる。 ​",
    images: [
      { url: "/images/image121.png", alt: "UVライトによる「光レシピ」" },
      { url: "/images/image131.png", alt: "UVライトによる「光レシピ」" },
    ],
    category: "Food & Agriculture",
    year: 2026,
  },
  {
    id: 70,
    number: 70,
    title: "食品開発のAI最適化",
    body: "食品メーカー向けに、栄養価向上・環境負荷低減・コスト削減を両立できる原材料の組み合わせを機械学習で提案するプラットフォームを提供。世界中の原材料ソース情報や栄養データなど、400億件以上のフードインサイトを持つデータベースを使い、上市までのリードタイムを最大40％短縮しうるとされる。 ​",
    images: [
      { url: "/images/image125.png", alt: "食品開発のAI最適化" },
      { url: "/images/image127.png", alt: "食品開発のAI最適化" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.journeyfoods.io/",
  },
  {
    id: 71,
    number: 71,
    title: "厨房のフードロス削減",
    body: "業務用厨房で、客が戻した皿を3Dスキャナで数秒スキャンし、画像・重量・温度を取得してAIで解析、どの料理がどれだけ廃棄されているかを可視化する。そのデータを使って需要予測やメニュー改善を行うことで、フードロスを最大90％削減した事例が報告されている。 ​",
    images: [
      { url: "/images/image124.png", alt: "厨房のフードロス削減" },
      { url: "/images/image134.png", alt: "厨房のフードロス削減" },
      { url: "/images/image130.png", alt: "厨房のフードロス削減" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.metafoodx.com/",
  },
  {
    id: 72,
    number: 72,
    title: "自宅での子宮頸がん検診",
    body: "女性創業チームによるTeal Healthは、FDA承認済みとしては初の在宅セルフサンプル採取デバイス「Teal Wand」を商品化し、診察室や膣鏡を使わずに自宅で子宮頸がん検診用の検体採取を可能にした。デバイスはテレヘルスプラットフォームと連携し、結果閲覧から継続的なケアまで一気通貫で提供され、1,200万ドル未満のスタートアップ資金と2025年1月の1,000万ドルのシードで市場投入に成功したと述べられている。",
    images: [
      { url: "/images/image135.png", alt: "自宅での子宮頸がん検診" },
    ],
    category: "Health & Wellness",
    year: 2026,
    reference: "https://www.getteal.com/",
  },
  {
    id: 73,
    number: 73,
    title: "サハラ砂漠で芋栽培",
    body: "By 2050,世界の食料需要は56％増えると見込まれ、限られた資源で人類を養うことが大きな課題になっている。 こうした中でAirponixは、従来より95％少ない水で作物を育てられる霧状の栽培技術を開発し、根を栄養豊富な「乾いた霧」のクラウドにさらすことで、水や土のムダをなくし、病害虫リスクも低減している。 すでに英国での商業運用に加え、2024年にはサウジアラビア砂漠に1,500平方メートル規模の種イモ施設を建設し、3.3万株を自動霧散システム付き温室で栽培できる体制を整えている。",
    images: [
      { url: "/images/image129.png", alt: "サハラ砂漠で芋栽培" },
      { url: "/images/image133.png", alt: "サハラ砂漠で芋栽培" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://airponix.com/",
  },
  {
    id: 74,
    number: 74,
    title: "AIとロボットで蜜蜂を救う",
    body: "2023年には米国のミツバチ群のほぼ半数が死滅し、世界の食料生産に深刻なリスクをもたらしているが、その大きな要因となっているのがバロアなどの致死性ダニだ。 ロボット養蜂スタートアップBeewiseは、化学薬品を使わずにバロアの99％を熱で殺す「BeeHome」の第4世代機を2024年に投入し、AIで必要な場所・タイミングだけに加熱を行う自律システムを実現している。 さらにオーバーン大学と連携してタイで急速に広がるトロピラエラプスダニへの有効性も検証し、曝露個体を100％駆除できたことが示されている。",
    images: [
      { url: "/images/image146.png", alt: "AIとロボットで蜜蜂を救う" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://beewise.ag/home",
  },
  {
    id: 75,
    number: 75,
    title: "持続可能な次世代木材",
    body: "鉄鋼生産は温室効果ガス排出の大きな要因だが、現在の建設には不可欠とされている。 InventWoodは、それをより持続可能で軽量・高強度な木材「SuperWood」で代替しようとしており、加熱と加圧によって通常の木材を加工することで、重量当たりの強度を鋼の最大10倍に高めつつ、耐火・耐候・耐腐食性も備えたと主張している。 2024年10月には外壁材の「SuperWood siding」を初製品として発売しており、森林にすでに存在する再生可能な素材を使うこのプロセスをスケールできれば、建設業界全体の排出削減に大きく貢献しうるとしている。",
    images: [
      { url: "/images/image144.png", alt: "持続可能な次世代木材" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.inventwood.com/",
  },
  {
    id: 76,
    number: 76,
    title: "脊髄感覚神経のシミュレーション",
    body: "脊髄損傷後の麻痺患者にはこれまで有効なリハビリ手段が限られていたが、感覚神経を電気刺激する新デバイス「ARC-Ex」がその状況を変えつつある。 Nature Medicine掲載の試験では、使用患者の90％で手の力や機能が改善し、紐靴を結ぶ・瓶のフタを開けるといった細かな動作を取り戻した例も報告されており、このオランダ企業Onward製の装置はFDA承認を得て現在10のクリニックで導入が始まり、年内に広く提供される予定となっている。",
    images: [
      { url: "/images/image140.png", alt: "脊髄感覚神経のシミュレーション" },
      { url: "/images/image138.png", alt: "脊髄感覚神経のシミュレーション" },
    ],
    category: "Fashion & Materials",
    year: 2026,
    reference: "https://www.fastcompany.com/91336535/onward-medical-world-changing-ideas-2025",
    focalHint: "25% 50%",
  },
  {
    id: 77,
    number: 77,
    title: "砂糖を置き換えるタンパク質",
    body: "西アフリカ原産の超甘い熱帯フルーツ「oubli」は砂糖ではなくbrazzeinという甘味タンパク質を含んでおり、これを起点にスタートアップOobliは砂糖代替となる甘味タンパク質を精密発酵で大量生産している。 このタンパク質は血糖値に影響を与えず、砂糖摂取に伴う健康リスクを避けられるとされ、FDAも同社の2種類のタンパク質について安全性データを審査し異議なしとし、現在は世界最大の製パン企業Grupo BimboなどがR&Dに活用し、新製品への展開を始めている。",
    images: [
      { url: "/images/image156.png", alt: "砂糖を置き換えるタンパク質" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.fastcompany.com/91336559/oobli-world-changing-ideas-2025",
  },
  {
    id: 78,
    number: 78,
    title: "街灯を充電器に",
    body: "EVは普及しつつある一方で、特に集合住宅など自宅に充電器を設置できない人にとって充電インフラ不足が大きな課題となっている。 Voltpostは既存の街灯をEV充電ハブに改造するソリューションを展開し、ミシガン、ニューヨーク、イリノイ、マサチューセッツなどの州でレベル2充電器を備えた街灯を導入することで、都市部の駐車時間を活用しつつ4〜10時間で0〜80％まで充電できる、より民主的なアクセスの実現を目指している。",
    images: [
      { url: "/images/image177.png", alt: "街灯を充電器に" },
    ],
    category: "Urban & Mobility",
    year: 2026,
    reference: "https://www.voltpost.com/",
    focalHint: "50% 40%",
  },
  {
    id: 79,
    number: 79,
    title: "緑化グラフィティ",
    body: "アスファルトやコンクリートが熱を吸収・放射することで起こるヒートアイランド現象は、緑が少ない低所得地域や周縁化されたコミュニティほど深刻になりやすい。 UCバークレーの修士プロジェクトから生まれたGuerrilla Greeningは、壁などに付着して成長する「スプレー／投てき型の植物グラフィティ」で街を緑化し、市販の農薬スプレーを改造した散布装置、植えられる種紙で作ったジンやオンラインマップなどを通じて、住民自らが自分たちの街のグリーンをコントロールできるようにすることを目指している。",
    images: [
      { url: "/images/image143.png", alt: "緑化グラフィティ" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://www.voltpost.com/",
  },
  {
    id: 80,
    number: 80,
    title: "未来の自分を戒めに",
    body: "MIT・KBTG・UCLA・ハーバードの研究者らは、ユーザーの「未来の自分」のデジタルツインをAIで生成し、その分身との対話を通じて将来像や願望を考えられるツールを開発している。 190カ国以上・5.2万人超が利用しており、不安の低減や将来の自分への一体感の向上が確認されていて、その結果として長期的な計画性・健康・学業成績の改善につながる可能性が示されている。 人間のロールプレイではなくAI対話に依拠するためスケーラブルで、ハーバード医学大学院ではグループセラピーへの応用実験も行われている。",
    images: [
      { url: "/images/image142.png", alt: "未来の自分を戒めに" },
    ],
    category: "Health & Wellness",
    year: 2026,
    reference: "https://www.voltpost.com/",
  },
  {
    id: 81,
    number: 81,
    title: "保護犬のためのAIと広告活用",
    body: "世界中で何百万頭もの犬が保護施設で新しい飼い主を待っている一方、その存在自体が十分に知られていないことが譲渡の壁になっている。 ペットフードブランドPedigreeは、実在の保護犬のフォトリアルな画像を広告に自動合成できるAIツールを開発し、高価な撮影なしにスタジオ品質のビジュアルを生成して近隣の里親希望者に保護犬情報を届けている。 ニュージーランドでのパイロットでは、保護施設の位置と周辺世帯のデモグラを活用してQRコード付きデジタル広告を最適配置し、掲載から2週間以内に対象犬の50％が譲渡に成功する成果が得られた。",
    images: [
      { url: "/images/image137.png", alt: "保護犬のためのAIと広告活用" },
      { url: "/images/image157.png", alt: "保護犬のためのAIと広告活用" },
    ],
    category: "Food & Agriculture",
    year: 2026,
    reference: "https://campaignbrief.com/pedigree-puts-real-dogs-from-local-shelters-at-the-centre-in-new-adoptable-campaign-via-colenso-bbdo-and-nexus-studios/",
  },
  {
    id: 82,
    number: 82,
    title: "Face to Faceを重視するロボタクシー",
    body: "Zooxは、内向き座席を備えた自律走行型配車車両を発表した。市販車を改造した既存のロボタクシーやライドシェアとは異なり、Zooxはドライバー席を設けず、乗客同士が向かい合う対称配置の座席を特徴とした車両を一から開発した。この車両は単なる移動手段ではなく、人と人関係をリデザインした社会的・空間的環境そのものとなる。",
    images: [
      { url: "/images/image158.png", alt: "Face to Faceを重視するロボタクシー" },
      { url: "/images/image147.png", alt: "Face to Faceを重視するロボタクシー" },
      { url: "/images/image197.jpg", alt: "Face to Faceを重視するロボタクシー" },
    ],
    category: "Technology",
    year: 2026,
    reference: "https://zoox.com/",
  },
  {
    id: 83,
    number: 83,
    title: "ウェルビーイングを神経レベルから",
    body: "神経領域の健康は、消費者向けウェルネス分野における主要な焦点として台頭しており、特に副交感神経系の調節に注目が集まっている。このシステムはストレス反応、回復、ホルモンバランス、そしてより広範なウェルビーイングにおいて中心的な役割を果たす。長年治療が困難とされてきたこれらの症状は、デバイスベースの介入によって対処されつつある。Pulsettoは不安状態を鎮めるために設計された日常着用型ウェアラブルを提供し、OhmBodyは月経痛の軽減、出血の調節、周期中の身体的負担の緩和に焦点を当てている。",
    images: [
      { url: "/images/image149.png", alt: "ウェルビーイングを神経レベルから" },
      { url: "/images/image148.png", alt: "ウェルビーイングを神経レベルから" },
    ],
    category: "Health & Wellness",
    year: 2026,
  },
  {
    id: 84,
    number: 84,
    title: "写真撮影の手軽さで身体の健康状態をスキャン",
    body: "イメージング技術により、従来は採血や診療所での処置を必要とした健康指標が、可視化された血流パターンから推測可能に。Nuralogix社の「Longevity Mirror」は短時間の動画撮影により血流と心拍の微小な変動を検知し、それらを精神的健康、加齢、睡眠、ストレス、回復に関連する指標に変換。わずか30秒のスキャンで健康状態の概観を把握できるため、評価の障壁が低減され、健康チェックの実施場所や方法に変化をもたらす。",
    images: [
      { url: "/images/image190.jpg", alt: "写真撮影の手軽さで身体の健康状態をスキャン" },
      { url: "/images/image150.png", alt: "写真撮影の手軽さで身体の健康状態をスキャン" },
      { url: "/images/image191.jpg", alt: "写真撮影の手軽さで身体の健康状態をスキャン" },
    ],
    category: "Health & Wellness",
    year: 2026,
  },
  {
    id: 85,
    number: 85,
    title: "体の限界をプッシュしてくれるエクソスケレトン",
    body: "外骨格は当初リハビリテーションや移動支援が想定されていたが、現在では産業労働者の重量物運搬支援や、ハイカー・愛好家の長距離歩行・過酷な地形への挑戦を可能にするなど、その用途は拡大している。これらのシステムはもはや回復支援だけでなく、日常的な身体能力の拡張を目的としている。 Ref: CES (CTA) https://ascentizexo.com/ https://www.assemblymag.com/articles/99050-hyundai-and-kia-invent-exoskeleton-to-reduce-shoulder-strain",
    images: [
      { url: "/images/image153.png", alt: "体の限界をプッシュしてくれるエクソスケレトン" },
      { url: "/images/image152.png", alt: "体の限界をプッシュしてくれるエクソスケレトン" },
    ],
    category: "Technology",
    year: 2026,
  },
  {
    id: 86,
    number: 86,
    title: "トイレに座って自己理解を深める",
    body: "かつてトイレは逃避の場であったかもしれないが、利用者に自身の健康に関する知見を提供しし始めている。Throneなどの企業が開発した装着型センサーは、水分補給レベルや腸内細菌叢の健康状態をユーザーに通知する。大塚製薬が支援するスタートアップVivooの尿検査ストリップはデジタルアプリと連動し、ケトン体、タンパク質、酸化ストレスなどの健康指標に関する包括的な分析結果を提供する。日常的な身体機能は、継続的に健康状態について多くの情報を教えてくれる。",
    images: [
      { url: "/images/image151.png", alt: "トイレに座って自己理解を深める" },
      { url: "/images/image154.png", alt: "トイレに座って自己理解を深める" },
    ],
    category: "Health & Wellness",
    year: 2026,
  },
  {
    id: 87,
    number: 87,
    title: "ウィンタースポーツから日常モビリティへ",
    body: "季節限定のスポーツであるスキーやスノーモービルをオフシーズンでも楽しめるよう、道路を基盤とした代替手段を見出している。Skwheel社やSternboard社といった企業は、陸上でウィンタースポーツのスリルや動きを体験できるマイクロモビリティを発売した。これらの機器は娯楽を提供するだけでなく、交通手段としても機能し、スポーツ、レジャー／アドベンチャー、通勤機能の境界線を曖昧にしている。",
    images: [
      { url: "/images/image159.png", alt: "ウィンタースポーツから日常モビリティへ" },
      { url: "/images/image162.png", alt: "ウィンタースポーツから日常モビリティへ" },
    ],
    category: "Technology",
    year: 2026,
  },
  {
    id: 88,
    number: 88,
    title: "旅全体をマッピングしてくれるナビ",
    body: "HERE TechnologiesはLucid Motorsと提携し、予測マッピングと車両データをナビゲーションに取り入れる。道案内に加え、地形、交通状況、運転行動、エネルギー消費を考慮し、指定ルート上の到着予定時刻（ETA）を正確に算出する。予測ナビゲーションは自信を持って旅程を計画するツールとなり、電気自動車のドライバーが電力切れを起こさずに目的地へ到着できることを保証してくれる。",
    images: [
      { url: "/images/image163.png", alt: "旅全体をマッピングしてくれるナビ" },
      { url: "/images/image155.png", alt: "旅全体をマッピングしてくれるナビ" },
    ],
    category: "Technology",
    year: 2026,
  },
  {
    id: 89,
    number: 89,
    title: "進んで廃棄したくなる安全な紙電池",
    body: "シンプルで生分解性のある素材から作られた紙製バッテリーが、リチウムイオン電池に代わる選択肢として市場に登場し始めている。日用品を十分に駆動でき、廃棄時の安全性や環境負荷の低さが特長だ。リサイクルの難しさや火災リスクが指摘される中、Flint Paper Batteryのような取り組みは、性能だけでなく「安全に終えられるエネルギー」を再定義している。",
    images: [
      { url: "/images/image198.jpg", alt: "進んで廃棄したくなる安全な紙電池" },
      { url: "/images/image202.png", alt: "進んで廃棄したくなる安全な紙電池" },
    ],
    category: "Fashion & Materials",
    year: 2026,
  },
  {
    id: 90,
    number: 90,
    title: "座るだけで楽して健康になるチェア",
    body: "Bodyfriendは、全身の健康を支えるシステムを備えたマッサージチェアを展開している。ロボティクス、エア加圧、温熱、適応型プログラムを組み合わせ、筋肉回復や姿勢、血流、ストレス調整をサポート。家庭や職場での日常利用を前提に、「座る時間」を健康価値へと転換している。",
    images: [
      { url: "/images/image173.jpg", alt: "座るだけで楽して健康になるチェア" },
    ],
    category: "Health & Wellness",
    year: 2026,
  },
  {
    id: 91,
    number: 91,
    title: "離れて暮らす家族に安全と温かみを",
    body: "Hisenseは、情緒的な存在感と実用性を兼ね備えたコンパニオンロボットを発表した。見守りや防犯、ペットの監視に加え、転倒や長時間の無動作を検知し、離れて暮らす家族へ通知する。単なる監視装置ではなく、関係性を築く家庭ロボットとして位置づけられている。",
    images: [
      { url: "/images/image200.png", alt: "離れて暮らす家族に安全と温かみを" },
      { url: "/images/image168.png", alt: "離れて暮らす家族に安全と温かみを" },
    ],
    category: "Technology",
    year: 2026,
  },
  {
    id: 92,
    number: 92,
    title: "一番面倒くさい家事までついに自動化間近",
    body: "LGエレクトロニクスは、CLOiに代表される家庭向けヒューマノイド／サービスロボットを通じ、住まいの体験を一気通貫で再設計している。CLOiは住人と対話し生活リズムを学習、洗濯から乾燥、取り出し、たたみまでを自律的に担う。家事負担を減らし、人の時間と集中力を解放する。",
    images: [
      { url: "/images/image167.png", alt: "一番面倒くさい家事までついに自動化間近" },
      { url: "/images/image161.png", alt: "一番面倒くさい家事までついに自動化間近" },
    ],
    category: "Technology",
    year: 2026,
  },
  {
    id: 93,
    number: 93,
    title: "3Dプリントの進化",
    body: "精度から柔軟性へ 3Dプリンティングは精度と速度の進化により、技術仕様そのものよりも素材の扱いやすさへと革新の軸が移行している。現在は金やセラミックなどの造形も可能になっている一方、柔軟素材が次の課題となっている。Tech21のFlexshockは、ゴム状で衝撃吸収性のある素材を繊維上に直接プリントでき、安全装備を中心に価値創出や試作の可能性を広げている。",
    images: [
      { url: "/images/image201.png", alt: "3Dプリントの進化" },
      { url: "/images/image164.png", alt: "3Dプリントの進化" },
    ],
    category: "Fashion & Materials",
    year: 2026,
  },
  {
    id: 94,
    number: 94,
    title: "感情のリズムを",
    body: "可視化 Mentagraphは、人の「メンタルバッテリー」を感知するウェアラブルリングを開発している。身体の疲労やエネルギー量と同様に、精神的な負荷も日々変動し限界があるが、把握しにくい。発汗反応や心拍数などをセンサーとアルゴリズムで数値化し、心の状態や余力を可視化することで、自分のペースに沿った行動を促すことを目指している。",
    images: [
      { url: "/images/image165.png", alt: "感情のリズムを" },
      { url: "/images/image166.png", alt: "感情のリズムを" },
    ],
    category: "Health & Wellness",
    year: 2026,
  },
  {
    id: 95,
    number: 95,
    title: "自己構成型・全方向ロボティクスモビリティ",
    body: "Hyundai Motor Companyは、産業用途から日常利用まで幅広い場面で活用可能なロボティックモビリティ基盤「MobED」を発表している。自律走行や遠隔操作に対応し、旋回や昇降、車幅調整、不整地走行など多方向の動きを実現する。モジュール型構造により用途拡張が容易で、人の移動から物流、作業支援までロボット活用の裾野を広げている。",
    images: [
      { url: "/images/image195.png", alt: "自己構成型・全方向ロボティクスモビリティ" },
      { url: "/images/image194.png", alt: "自己構成型・全方向ロボティクスモビリティ" },
      { url: "/images/image196.png", alt: "自己構成型・全方向ロボティクスモビリティ" },
      { url: "/images/image169.png", alt: "自己構成型・全方向ロボティクスモビリティ" },
      { url: "/images/image175.png", alt: "自己構成型・全方向ロボティクスモビリティ" },
      { url: "/images/image170.png", alt: "自己構成型・全方向ロボティクスモビリティ" },
    ],
    category: "Technology",
    year: 2026,
  },
  {
    id: 96,
    number: 96,
    title: "一瞬で変えられる、",
    body: "ネイルカラー 私たちの身の回りの色の多くは顔料由来で固定されており、嗜好やトレンド、社会的文脈が変わっても変化しにくい。iPolishは、貼るネイルのような装着感を持ちながら、電気泳動ナノポリマー技術で数秒で色を切り替えられるデジタルネイルを提案。300色以上から選択し、着用中も柔軟に調整できることで、ネイル体験を可変的なものへと拡張している。",
    images: [
      { url: "/images/image171.png", alt: "一瞬で変えられる、" },
    ],
    category: "Culture & Society",
    year: 2026,
  },
  {
    id: 97,
    number: 97,
    title: "Wearable Neurotechnology for Diabetic Peripheral Neuropathy",
    body: "Minerva is a company that develops wearable technologies for the treatment of diabetic neuropathy. Leia is a neuroprosthetic sock designed to monitor foot conditions and deliver gentle electrical stimulation to support people living with diabetic peripheral neuropathy. These technologies help save time for patients and clinicians, reduce unnecessary hospital visits, and maximize overall health outcomes.",
    images: [
      { url: "/images/image172.png", alt: "Wearable Neurotechnology for Diabetic Pe" },
      { url: "/images/image174.png", alt: "Wearable Neurotechnology for Diabetic Pe" },
    ],
    category: "Health & Wellness",
    year: 2026,
  },
  {
    id: 98,
    number: 98,
    title: "Reimagine lighting",
    body: "Driven by the desire for mood-boosting daylight, two designer invented an overhead light that recreates the feeling of a sunny day. The Sunday Light consists of a small but powerful LED suspended beneath a reflective panel, designed to diffuse light in a way similar to the Earth’s atmosphere, gently dispersing it throughout a room. The light is bright enough to have a therapeutic effect on mood. Furniture and lighting designs with this kind of functionality broaden the possibilities of future furniture and environmental design, shifting them from passive objects to active contributors to well-being.",
    images: [
      { url: "/images/image179.png", alt: "Reimagine lighting" },
      { url: "/images/image182.png", alt: "Reimagine lighting" },
      { url: "/images/image176.png", alt: "Reimagine lighting" },
    ],
    category: "Technology",
    year: 2026,
  },
  {
    id: 99,
    number: 99,
    title: "Microbiome Engineering in Agriculture",
    body: "Microbiome engineering has emerged as a powerful driver of innovation across multiple domains. In agriculture, it serves as a key pathway toward sustainability by enhancing crop growth, restoring soil health, and reducing dependence on chemical inputs. While challenges remain in regulation, infrastructure, and policy, future advances in this field could significantly contribute to global food security, climate resilience, and sustainable development.",
    images: [
      { url: "/images/image186.png", alt: "Microbiome Engineering in Agriculture" },
      { url: "/images/image185.png", alt: "Microbiome Engineering in Agriculture" },
    ],
    category: "Food & Agriculture",
    year: 2026,
  },
  {
    id: 100,
    number: 100,
    title: "BCI and Neuralink",
    body: "Neuralink is a leading neurotechnology company developing implantable brain–computer interfaces (BCI) aimed at treating severe neurological conditions and restoring independence to individuals with paralysis. Its primary goal is to enable people with paralysis or neurological disorders, such as ALS, to communicate and interact with digital technologies directly through their neural signals.",
    images: [
      { url: "/images/image184.png", alt: "BCI and Neuralink" },
      { url: "/images/image181.png", alt: "BCI and Neuralink" },
    ],
    category: "Health & Wellness",
    year: 2026,
  },
  {
    id: 101,
    number: 101,
    title: "ココエ:",
    body: "Design for longevity NTTの音響技術を活用した、新しい“聞こえ”で毎日を高めるブランド『cocoe（ココエ）』を、2025年12月3日（水）に発表します 『cocoe（ココエ）』は、加齢や生活環境によって生じる“聞こえづらさ”に寄り添い、誰もが自分らしく会話や音を楽しめる社会の実現をめざして生まれたブランドです。日本では約1,430万人※2が“聞こえ”に課題を抱えているといわれ、聞こえづらさは認知症リスク※3や社会的孤立など、生活の質（QOL）を左右する社会課題にもつながっています。(copy-pasted from web)",
    images: [
      { url: "/images/image183.png", alt: "ココエ:" },
      { url: "/images/image180.png", alt: "ココエ:" },
      { url: "/images/image188.png", alt: "ココエ:" },
      { url: "/images/image193.png", alt: "ココエ:" },
      { url: "/images/image189.png", alt: "ココエ:" },
      { url: "/images/image192.png", alt: "ココエ:" },
    ],
    category: "Culture & Society",
    year: 2026,
  },
];

export const categories = [...new Set(signals.map((s) => s.category).filter(Boolean))] as string[];
