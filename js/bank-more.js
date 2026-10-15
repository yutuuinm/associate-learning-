/* 题库补充：用六级核心词库的高频词（1 档）写的新卷
   写的时候刻意让 1 档词自然出现在文章里——读一篇等于过一遍高频词
   题型字段与 bank-reading.js 一致：loc/locZh 定位、why 解析、trap 干扰项、guess 蒙题思路、l2 二级提示 */
window.CET6 = window.CET6 || {};
window.CET6.BANK = window.CET6.BANK || {};

(function(){
var B = window.CET6.BANK;
B.readings = B.readings || [];
B.cloze = B.cloze || [];

/* ================= R05 随时可得的代价 ================= */
B.readings.push({
 id:'R05', title:'The Cost of Being Reachable', topic:'科技 · 心理', words:236, src:'仿真', level:1,
 text:[
  ["The appeal of the smartphone is easy to demonstrate. It places an enormous amount of information within reach of anyone who can afford one, and it does so at a speed that would have seemed absurd thirty years ago.",
   "智能手机的吸引力很容易说明。它把海量信息放到了任何一个买得起它的人手边，而且速度之快在三十年前会显得荒唐。"],
  ["What is harder to appreciate is what that access costs. Researchers who analyze how people distribute their attention report a consistent pattern: the more available a device is, the more often it interrupts, and each interruption leaves a residue that slows the task it broke into.",
   "更难意识到的是，这种随时可得的代价是什么。研究人们如何分配注意力的学者报告了一个稳定的规律：设备越唾手可得，它打断你的次数就越多，而每一次打断都会留下残余，拖慢被打断的那件事。"],
  ["A considerable body of work now demonstrates that even brief interruptions disrupt performance on tasks that require concentration. The effect is not confined to the laboratory; studies conducted in ordinary offices associate a higher frequency of alerts with more errors and longer completion times.",
   "现在已有相当多的研究证明，即便是很短暂的打断也会干扰需要注意力集中的任务表现。这种效应并不只存在于实验室：在普通办公室里开展的研究把更高频的提醒与更多的错误、更长的完成时间联系在了一起。"],
  ["It would be absurd to attribute this entirely to the devices. Notification systems were built to capture attention, and they succeed because they exploit a capacity that evolved for a very different environment. The conflict is not between people and their phones but between two incompatible uses of the same few seconds.",
   "把这一切完全归因于设备是荒唐的。通知系统本来就是为攫取注意力而造的，它们之所以奏效，是因为它们利用了一种在完全不同的环境里演化出来的能力。冲突并不发生在人与手机之间，而发生在同一小段时间的两种互不兼容的用法之间。"],
  ["The practical conclusion is modest. Reducing access — leaving the phone in another room, silencing alerts for an hour — recovers more attention than any attempt at self-discipline while the device sits within reach. What matters is not how much one uses it, but how available it is while one is doing something else.",
   "实际的结论是克制的。减少可得性——把手机放到另一个房间、让提醒静音一小时——比任何「设备就在手边还靠自制力忍住」的尝试都更能找回注意力。重要的不是你用了多少，而是你在做别的事时它有多可得。"]
 ],
 qs:[
  {n:1,type:'main',q:'这篇文章主要讨论的是：',
   o:['智能手机的技术演进史','随时可得带来的注意力代价，以及可行的应对','办公室里做实验的方法','如何彻底禁用通知系统'],
   a:1,
   loc:'What is harder to appreciate is what that access costs',
   locZh:'更难意识到的是，这种随时可得的代价是什么',
   why:'全文结构：先承认手机的价值（第 1 段），再提出真正的问题（第 2 段 access costs），接着给证据（第 3 段），最后给克制的结论（第 5 段）。B 的「代价 + 应对」覆盖了后四段的主线。',
   trap:['A：技术演进只在第 1 段一句话里出现，是背景不是主题。','C：办公室研究是第 3 段的例证，拿例证当主旨是最常见的错法。','D："彻底禁用"比原文激进得多，原文说的是降低可得性，不是禁用。'],
   guess:'四个选项里，A、C 都只对应某一段的具体内容，D 出现「彻底」这种极端词。剩下 B 既能概括现象也能概括结论，是主旨题正确项的长相。',
   l2:'主旨题看两处：第 2 段的 harder to appreciate（转折到真正的话题），和末段的 The practical conclusion（结论）。',hot:5},
  {n:2,type:'detail',q:'第 3 段提到的办公室研究发现什么？',
   o:['提醒越频繁，错误越多、完成时间越长','提醒能帮助员工更快完成任务','实验室结果无法在真实环境中复现','打断只影响简单任务'],
   a:0,
   loc:'associate a higher frequency of alerts with more errors and longer completion times',
   locZh:'把更高频的提醒与更多的错误、更长的完成时间联系在了一起',
   why:'原句直接给出：higher frequency → more errors + longer completion times。A 是逐词对应的改写。',
   trap:['B：方向相反，原文说打断拖慢任务。','C：恰恰相反，原文说效应并不只存在于实验室。','D："只影响简单任务"原文没提，是凭常识加的限制。'],
   guess:'细节题不许推理，回原文逐词比对。看到 associate ... with ... 就知道它在讲两者的对应关系，选项里哪一个是这层对应，就是答案。',
   l2:'定位第 3 段的分号后：studies conducted in ordinary offices 后面就是发现。',hot:5},
  {n:3,type:'meaning',q:'第 2 段中的 "appreciate" 最接近：',
   o:['欣赏、感谢','意识到、看清','提高、增值','估计数量'],
   a:1,
   loc:'What is harder to appreciate is what that access costs',
   locZh:'更难意识到的是，这种随时可得的代价是什么',
   why:'后面接的是「代价是什么」，只有「意识到、看清」能接得上。这里不是「欣赏」的意思，考的就是熟词僻义。',
   trap:['A：appreciate 最常见的中文是"欣赏/感谢"，但在这里与"代价"搭配不通。','C、D：与语境无关。'],
   guess:'词义题别按最常见义项选，把四个选项代回原句读一遍，读不通的就是干扰项。',
   l2:'把选项逐一代回 harder to ___ is what that access costs，只有"意识到"讲得通。',hot:5},
  {n:4,type:'infer',q:'作者暗示，真正影响注意力的是：',
   o:['使用手机的总时长','手机在做别的事时有多可得','用户缺乏自制力','通知系统本身的设计'],
   a:1,
   loc:'What matters is not how much one uses it, but how available it is while one is doing something else',
   locZh:'重要的不是你用了多少，而是你在做别的事时它有多可得',
   why:'末句用 not ... but ... 直接把答案摆在眼前：不是用了多少，是有多可得。B 是同义改写。',
   trap:['A：被 not 明确否定了。','C：原文说靠自制力"不如"降低可得性有效，没说缺乏自制力是原因。','D：第 4 段说不该完全归因于设备。'],
   guess:'推断题正确项一定是原文的同义改写。看到 not A but B 这种结构，答案几乎必然是 but 后面那半句。',
   l2:'定位末段最后一句，not ... but ... 的重心永远在 but 之后。',hot:5},
  {n:5,type:'attitude',q:'作者对智能手机的态度是：',
   o:['完全肯定，认为问题被夸大了','承认其价值，同时指出代价并给出务实建议','强烈否定，主张尽量不用','不置可否'],
   a:1,
   loc:'It would be absurd to attribute this entirely to the devices ... The practical conclusion is modest',
   locZh:'把这一切完全归因于设备是荒唐的……实际的结论是克制的',
   why:'第 1 段承认吸引力，第 4 段拒绝把责任全推给设备，第 5 段给出有限的建议——典型的「承认一部分、保留一部分」。',
   trap:['A：与后四段的批评相反。','C：作者明确说不该完全归因于设备，且结论是 modest，不是激进否定。','D：全文有明确立场。'],
   guess:'态度题先砍极端项（A 的"完全"、C 的"强烈"）。剩下两个里选那个"承认一部分、保留一部分"的。',
   l2:'态度题找评价句：第 4 段的 absurd、第 5 段的 modest，两个词合起来就是作者的立场。',hot:4}
 ]
});

/* ================= R06 稀缺床位怎么分 ================= */
B.readings.push({
 id:'R06', title:'Who Gets the Bed', topic:'医疗 · 伦理', words:242, src:'仿真', level:2,
 text:[
  ["Every health system eventually faces the same question: when a resource is scarce, who should receive it? The question is not abstract. During severe outbreaks, intensive care beds have been allocated by guidelines written in a matter of days, and clinicians have had to apply them to patients they had never met.",
   "每一个医疗系统最终都要面对同一个问题：当资源稀缺时，谁应该得到它？这个问题并不抽象。在严重的疫情暴发期间，重症床位曾按照几天之内写出的指南来分配，而临床医生不得不把它们用在素不相识的病人身上。"],
  ["Three principles compete, and they cannot all be satisfied. Saving the most lives favours patients with the best prospects, which tends to deprive the oldest and the sickest. Treating the most urgent cases first reverses that priority. A first-come rule is impartial in form but in practice advantages those who live near a good hospital.",
   "有三条原则在相互竞争，而它们无法同时被满足。拯救最多生命偏向于预后最好的病人，这往往会剥夺年老者和病重者的机会。优先救治最紧急的病例则把这个优先级反过来。先到先得的规则在形式上是中立的，实际上却是有利于住在好医院附近的人。"],
  ["What most guidelines now concede is that no formula can eliminate the judgement involved. Scores meant to be objective still depend on which conditions are counted and how they are weighted, and those choices are moral rather than technical. Crucially, the people who make them are rarely the people who bear the consequences.",
   "如今大多数指南都承认，没有任何公式能消除其中涉及的判断。本应客观的量表仍然取决于把哪些疾病计入、各占多少权重，而这些选择是道德层面的，不是技术层面的。关键的是，做出这些选择的人很少是承担后果的人。"],
  ["That is why the procedural argument has gained ground. If the outcome cannot be shown to be fair, the process at least can: publish the criteria in advance, consult the groups most affected, and give patients or their families a way to appeal. Transparency does not make the decision easier, but it makes it defensible.",
   "正因如此，程序性的论证逐渐占了上风。如果结果无法被证明是公平的，至少过程可以：提前公布标准、咨询受影响最大的群体、并给病人或其家属一条申诉的路径。透明并不会让决定变得更容易，但会让它变得可以辩护。"],
  ["Critics reply that procedure is a poor substitute for justice, and they are right in one respect: a fair process can still distribute a scarce resource in ways that compound existing inequality. But the alternative — leaving the choice to whoever happens to be on shift, guided by nothing but intuition — is worse.",
   "批评者回应说，程序并不能替代正义，他们在一点上是对的：一个公平的程序仍可能以加剧既有不平等的方式去分配稀缺资源。但另一种选择——把决定留给恰好当班的人，只靠直觉来指引——更糟。"]
 ],
 qs:[
  {n:1,type:'main',q:'文章的中心议题是：',
   o:['重症医学的技术进展','稀缺医疗资源该按什么原则分配，以及程序为何重要','疫情期间的医院管理','如何培训临床医生做伦理决策'],
   a:1,
   loc:'when a resource is scarce, who should receive it? ... That is why the procedural argument has gained ground',
   locZh:'当资源稀缺时，谁应该得到它？……正因如此，程序性的论证逐渐占了上风',
   why:'第 1 段提出问题，第 2 段列三条原则的冲突，第 3 段说判断无法被公式消除，第 4 段给出程序方案，末段回应批评。B 覆盖「原则之争 + 程序」。',
   trap:['A、D：全文没谈技术或培训。','C：疫情只是第 1 段举的场景，不是议题。'],
   guess:'主旨题排除只对应某一选项所在段落的例子项。A、C、D 都指向具体场景或职业，B 提的是原则和程序这种贯穿全文的抽象对象。',
   l2:'抓首段的设问句（who should receive it）和第四段的 That is why —— 后者把文章推向了答案。',hot:5},
  {n:2,type:'detail',q:'关于「先到先得」的规则，文章指出了什么问题？',
   o:['它完全不公正，应被废除','它形式上中立，实际上有利于住在好医院附近的人','它最有利于病情最危重的病人','它比量表更客观'],
   a:1,
   loc:'A first-come rule is impartial in form but in practice advantages those who live near a good hospital',
   locZh:'先到先得的规则在形式上是中立的，实际上却是有利于住在好医院附近的人',
   why:'in form ... but in practice ... 这个对照直接给出：形式中立、实质偏向。B 逐词对应。',
   trap:['A：原文没主张废除，只说它实质不公平。','C：那是另一条原则（最紧急优先）。','D：原文说量表也不客观，没说它更客观。'],
   guess:'看到选项里出现"完全""最""比……更"这类比较或绝对表达时，先回原文核对，通常原文只说了"某一方面有偏差"。',
   l2:'定位第 2 段最后一句，找 first-come。',hot:5},
  {n:3,type:'meaning',q:'第 3 段中的 "concede" 最接近：',
   o:['争论、反驳','承认（不太情愿地）','隐瞒','推测'],
   a:1,
   loc:'What most guidelines now concede is that no formula can eliminate the judgement involved',
   locZh:'如今大多数指南都承认，没有任何公式能消除其中涉及的判断',
   why:'指南本来强调客观性，现在承认做不到——带有让步意味的"承认"。',
   trap:['A：与让步方向相反。','C、D：与语境无关。'],
   guess:'词义题看句子的情感方向：后半句说做不到，前面必然是"承认做不到"。',
   l2:'看 What most guidelines now concede 后面接的内容，是它们不愿接受但不得不接受的事实。',hot:5},
  {n:4,type:'infer',q:'作者认为，量表评分之所以不能完全客观，是因为：',
   o:['数据收集不充分','计入哪些疾病、各占多少权重本身是道德选择','医生缺乏统计训练','病情本身无法测量'],
   a:1,
   loc:'depend on which conditions are counted and how they are weighted, and those choices are moral rather than technical',
   locZh:'取决于把哪些疾病计入、各占多少权重，而这些选择是道德层面的，不是技术层面的',
   why:'moral rather than technical = 是价值选择不是技术选择，B 是同义改写。',
   trap:['A、C、D：都是原文没有的操作性解释。'],
   guess:'推断题正确项一定是原文的改写。选项里出现"道德/价值"这类词，而原文有 moral，基本就是它。',
   l2:'定位第 3 段 Scores meant to be objective 后面那一句。',hot:5},
  {n:5,type:'attitude',q:'作者对「用程序保证公平」这一思路的态度是：',
   o:['完全支持，认为它能实现正义','有保留地支持：承认它不够，但比没有程序好','明确反对，认为程序只是形式','未作评价'],
   a:1,
   loc:'Transparency does not make the decision easier, but it makes it defensible ... the alternative ... is worse',
   locZh:'透明并不会让决定变得更容易，但会让它变得可以辩护……另一种选择……更糟',
   why:'末段承认程序可能加剧不平等（保留），接着说没有程序更糟（支持）——两句话合起来就是"有保留地支持"。',
   trap:['A：与末段承认缺陷矛盾。','C：与"另一种选择更糟"矛盾。'],
   guess:'出现"承认…但…"这种双层表述的选项，比一边倒的更符合学术文章的态度题答案。',
   l2:'态度题重点看末段：critics ... they are right in one respect ... But ... is worse。',hot:4}
 ]
});

/* ================= R07 房子为什么越来越贵 ================= */
B.readings.push({
 id:'R07', title:'Why the Flats Stay Empty', topic:'城市 · 经济', words:238, src:'仿真', level:2,
 text:[
  ["In most large cities, the housing question has stopped being about shelter and started being about assets. A flat is still somewhere to live, but it also constitutes a store of value, and the second function now dominates the first. Prices in a dozen global cities have risen far faster than local incomes for two decades, and the gap does not close when construction accelerates.",
   "在大多数大城市，住房问题已经不再是关于栖身之所，而是关于资产。公寓仍然是住的地方，但它同时也是一种价值储存手段，而这第二个功能如今压倒了第一个。十几个全球城市的房价二十年来涨得远快于本地收入，而且当建设加速时，这个缺口并不会收窄。"],
  ["The conventional explanation is a shortage of supply: too few homes are built where people want to live. This is partly true. In cities that accommodate population growth by releasing land and permitting taller buildings, rents rise more slowly. But several markets with abundant building have still seen prices climb, which suggests demand is doing as much work as supply.",
   "通常的解释是供给不足：在人们想住的地方建的房子太少。这有一部分是对的。在那些通过放出土地、允许建更高楼来容纳人口增长的城市，租金涨得更慢。但有几个建设量充足的市场仍然出现了房价上涨，这说明需求的作用不亚于供给。"],
  ["Much of that demand is not for housing at all. When interest rates are low, property becomes the default vehicle for capital, and apartments bought as investments are frequently left empty. A district can therefore show a boom in completions while the number of residents barely moves — units exist, but they house nobody.",
   "其中相当一部分需求根本不是为了住房。当利率低时，房产成了资本的默认去处，而作为投资买下的公寓常常被空置。因此，一个区域可能出现竣工量的繁荣，而居民数量几乎不动——房子存在，却没有人住。"],
  ["The consequences are not confined to buyers. Long commutes, households that spend a dominant share of income on rent, and neighbourhoods whose shops serve visitors rather than residents all follow from the same cause. Cities also lose something harder to measure: the diverse mix of people and businesses that makes dense districts work in the first place.",
   "后果并不只落在买房者身上。长距离通勤、把收入的主要部分花在租金上的家庭、以及商铺服务游客而非居民的街区，都出自同一个原因。城市还失去了某种更难衡量的东西：正是那种让高密度街区得以运转的人与营生的多元混合。"],
  ["Policy has been slow to respond because the interests conflict. Owners benefit from rising values; renters, first-time buyers and employers who cannot recruit do not. Taxing empty units is the most direct instrument available, and a few cities have used it, but the sums involved are usually too small to change behaviour.",
   "政策之所以反应迟缓，是因为利益相互冲突。业主从升值中获益；租房者、首次置业者和招不到人的雇主则不获益。对空置单元征税是现有最直接的工具，已有少数城市使用，但涉及的金额通常太小，不足以改变行为。"]
 ],
 qs:[
  {n:1,type:'main',q:'文章主要分析的是：',
   o:['建筑技术的进步','大城市房价为何难降：资产属性与空置的作用','租金管制的具体做法','城市通勤问题的成因'],
   a:1,
   loc:'it also constitutes a store of value ... Much of that demand is not for housing at all',
   locZh:'它同时也是一种价值储存手段……其中相当一部分需求根本不是为了住房',
   why:'主线是：住房变成资产（第 1 段）→ 供给解释不够（第 2 段）→ 投资性需求与空置（第 3 段）→ 后果（第 4 段）→ 政策为何难（第 5 段）。B 抓住了两头。',
   trap:['A：全文没谈建筑技术。','C：租金管制没被讨论，只对空置征税一笔带过。','D：通勤只是第 4 段列举的后果之一。'],
   guess:'A 和 C 是全文没谈的东西，直接排除；D 是局部后果。剩下 B 同时含"房价"和"原因"，正是主旨项。',
   l2:'抓第 1 段 stopped being about shelter ... assets 和第 3 段 not for housing at all，这两句定了全文方向。',hot:5},
  {n:2,type:'detail',q:'第 3 段提到一种看似矛盾的现象，指的是：',
   o:['利率低但房价高','竣工量繁荣，居民数量却几乎不动','租金上涨但收入也上涨','建设加速但成本下降'],
   a:1,
   loc:'a boom in completions while the number of residents barely moves',
   locZh:'竣工量的繁荣，而居民数量几乎不动',
   why:'原句用 while 把两个相反的事实并列：竣工多 + 居民没变。B 逐词对应。',
   trap:['A：利率低是背景，不是矛盾现象。','C、D：原文未提及。'],
   guess:'细节题盯住段落里的转折/对照词（while / but / however），考点九成在后面那半句。',
   l2:'定位第 3 段末：定位词是 boom in completions 和 residents。',hot:5},
  {n:3,type:'meaning',q:'第 2 段中的 "accommodate" 最接近：',
   o:['容纳、接纳','适应、妥协','提供住宿给','测量'],
   a:0,
   loc:'cities that accommodate population growth by releasing land and permitting taller buildings',
   locZh:'那些通过放出土地、允许建更高楼来容纳人口增长的城市',
   why:'宾语是 population growth（人口增长），与之搭配的是"容纳"。注意不是"提供住宿"，那是 accommodate 的另一个义项。',
   trap:['C：accommodate 常见义项是住宿，但这里的宾语是人口增长，搭配不通。','B、D：与语境无关。'],
   guess:'词义题把选项代回原句：能接 population growth 的只有"容纳"。',
   l2:'看宾语：accommodate + population growth，不是 accommodate + people。',hot:5},
  {n:4,type:'infer',q:'作者暗示，仅靠增加建设量难以压住房价，因为：',
   o:['建筑成本太高','相当一部分需求是投资性的，房子建了也可能空着','人口停止增长','土地无法释放'],
   a:1,
   loc:'demand is doing as much work as supply ... apartments bought as investments are frequently left empty',
   locZh:'需求的作用不亚于供给……作为投资买下的公寓常常被空置',
   why:'第 2 段末说需求与供给同等重要，第 3 段解释需求是什么（投资、空置）。B 把两句合并说出来了。',
   trap:['A、D：原文没说成本或土地是障碍（第 2 段反而说有城市成功释放了土地）。','C：与人口增长的前提矛盾。'],
   guess:'推断题要跨段合并信息：第 2 段末的伏笔 + 第 3 段的解释，答案通常是这两处的合写。',
   l2:'把第 2 段最后一句和第 3 段读在一起，前者提问、后者回答。',hot:5},
  {n:5,type:'attitude',q:'作者对「对空置房征税」这一做法的评价是：',
   o:['是最有效的根本解决方案','方向对，但力度通常不足以改变行为','完全无效，不值得尝试','会严重损害业主利益'],
   a:1,
   loc:'the most direct instrument available, and a few cities have used it, but the sums involved are usually too small to change behaviour',
   locZh:'现有最直接的工具，已有少数城市使用，但涉及的金额通常太小，不足以改变行为',
   why:'先肯定（最直接的工具），再限定（金额太小不足以改变行为）——B 完整复述了这个两层评价。',
   trap:['A：被 but 之后的内容否定。','C：与"最直接的工具"矛盾。','D：原文没谈对业主的损害。'],
   guess:'选项里出现"方向对但力度不够"这种双层表述时，往往就是原文 but 结构对应的答案。',
   l2:'定位末段最后一句，most direct ... but ... too small，评价就在这两个词之间。',hot:4}
 ]
});

/* ================= R08 石头会说话 ================= */
B.readings.push({
 id:'R08', title:'What the Stones Say', topic:'考古 · 历史', words:232, src:'仿真', level:3,
 text:[
  ["Obsidian does not occur everywhere. It forms where volcanoes have erupted, and each source has a chemical signature distinct enough to be identified in the laboratory. When archaeologists find obsidian tools three hundred kilometres from the nearest outcrop, they can therefore do more than admire the object: they can attribute it to a particular mountain.",
   "黑曜石并非到处都有。它形成于火山喷发之处，而每一处产地都有一套化学特征，其特征之独特足以在实验室里被辨认出来。因此，当考古学家在距最近露头三百公里处发现黑曜石工具时，他们能做的就不只是欣赏这件器物：他们还能把它归因于某一座特定的山。"],
  ["Such findings have overturned an older picture of ancient life. For much of the twentieth century, prehistoric communities were depicted as small and self-sufficient, obtaining everything they needed within a day's walk. The distribution of stone tells a different story: by the Neolithic, materials were moving along routes that linked settlements across considerable distances.",
   "这类发现推翻了一种更古老的关于古代生活的图景。在二十世纪的大多数时间里，史前社群被描绘成小而自足的，在一天步行范围内取得所需的一切。石头的分布讲述的是另一个故事：到新石器时代，材料正沿着连接远距离聚落的路线流动。"],
  ["What is harder to establish is how they moved. A toolkit found far from its source might have travelled through exchange between neighbours, through the movement of a family, or through trade conducted by specialists. These mechanisms leave similar traces, and the tendency has been to attribute the evidence to whichever mechanism the excavator prefers.",
   "更难确定的是它们如何流动。一件在远离产地处被发现的工具，可能是通过邻里之间的交换、一个家庭的迁徙，或由专人进行的贸易而移动过去的。这些机制留下的痕迹相似，而学界一直倾向于把证据归因于发掘者本人偏好的那种机制。"],
  ["Recent work has begun to separate them. Where tools from many different sources occur together in a single settlement, direct exchange between households looks unlikely, and the pattern is more consistent with organised procurement. Where a single source dominates a small site, the simpler explanation is that people carried the stone themselves.",
   "最近的研究开始把它们区分开来。在一个聚落里同时出现来自许多不同产地的工具时， households 之间的直接交换看起来不太可能，而这种格局更接近于有组织的获取。当某个小遗址由单一产地主导时，更简单的解释是人们自己把石头带了过去。"],
  ["The stakes are not merely technical. If goods moved through networks, then ideas probably did too, and the conventional boundary between one culture and the next becomes harder to draw. A stone tool, read carefully, constitutes evidence about how far a person's world extended.",
   "这其中的利害不只是技术性的。如果货物是通过网络流动的，那么思想大概也是如此，而一种文化与下一种文化之间的传统界限就更难划分了。一枚石制工具，若被仔细解读，就构成了关于一个人的世界延伸到多远的证据。"]
 ],
 qs:[
  {n:1,type:'main',q:'文章主要讨论的是：',
   o:['黑曜石的化学成分分析','通过石料产地追溯古代人群的流动与交换网络','新石器时代的农业起源','考古发掘的技术规范'],
   a:1,
   loc:'they can attribute it to a particular mountain ... The distribution of stone tells a different story',
   locZh:'他们还能把它归因于某一座特定的山……石头的分布讲述的是另一个故事',
   why:'全文从"能溯源产地"（第 1 段）→ "改写了对古代社群的认识"（第 2 段）→ "难的是如何流动"（第 3 段）→ "新方法能区分机制"（第 4 段）→ "意义"（第 5 段）。B 抓住了对象和方法。',
   trap:['A：化学分析只是第 1 段的手段。','C：农业没被讨论。','D：发掘规范不是议题。'],
   guess:'A、C、D 都是全文没展开或只出现在某一句的内容。B 同时含"石料"和"人群流动"，是唯一能贯穿全文的。',
   l2:'抓第 1 段的 therefore（于是能做的事）和第 2 段的 Such findings have overturned。',hot:5},
  {n:2,type:'detail',q:'第 4 段说，当一个聚落里同时出现多个产地的工具时，更可能是哪种情况？',
   o:['家庭之间的直接交换','有组织的获取','人们自己携带','产地就在附近'],
   a:1,
   loc:'direct exchange between households looks unlikely, and the pattern is more consistent with organised procurement',
   locZh:'家庭间的直接交换看起来不太可能，而这种格局更接近于有组织的获取',
   why:'原句先否定 A，再给出 organised procurement（有组织的获取）。B 是同义改写。',
   trap:['A：被 looks unlikely 直接否定。','C：那是"单一产地主导小遗址"时的解释，属于张冠李戴。','D：原文没提产地在附近。'],
   guess:'细节题最爱考"张冠李戴"——把另一种条件下的解释搬到这一题。核对定位句里的条件（many different sources vs single source）就能排掉。',
   l2:'定位第 4 段，先找 many different sources 这个条件，答案在它后面。',hot:5},
  {n:3,type:'meaning',q:'第 5 段中的 "constitutes" 最接近：',
   o:['构成、成为','取代','质疑','分类'],
   a:0,
   loc:'constitutes evidence about how far a person\'s world extended',
   locZh:'构成了关于一个人的世界延伸到多远的证据',
   why:'主语是石制工具、宾语是证据，constitute + evidence = 构成证据。',
   trap:['B、C、D：与"工具—证据"这层关系无关。'],
   guess:'看主语和宾语的关系：工具___证据，只有"构成"能把两者接起来。',
   l2:'把四个选项代回原句，只有"构成"读得通。',hot:5},
  {n:4,type:'infer',q:'作者暗示，学界过去在解释石料的远距离出现时存在一个偏差：',
   o:['过于依赖化学分析','倾向于按发掘者自己偏好的机制来解释','忽视了产地的存在','高估了贸易的作用'],
   a:1,
   loc:'the tendency has been to attribute the evidence to whichever mechanism the excavator prefers',
   locZh:'学界一直倾向于把证据归因于发掘者本人偏好的那种机制',
   why:'whichever mechanism the excavator prefers = 按研究者偏好，B 直接对应。',
   trap:['A：化学分析是第 1 段的可靠手段，没被批评。','C：与原文相反。','D：原文说的是三种机制都可能被偏好，不止贸易。'],
   guess:'推断题正确项是原文改写。选项里出现"研究者偏好"这种主观因素，而原文有 prefers，就是它。',
   l2:'定位第 3 段最后一句，the tendency has been 后面就是批评。',hot:5},
  {n:5,type:'attitude',q:'作者对「用石料产地重建古代网络」这一研究路径的态度是：',
   o:['认为它已完全解决问题','肯定其价值，同时指出机制判断仍困难','怀疑其化学方法不可靠','认为它对理解文化毫无帮助'],
   a:1,
   loc:'they can therefore do more than admire the object ... What is harder to establish is how they moved',
   locZh:'他们能做的就不只是欣赏这件器物……更难确定的是它们如何流动',
   why:'第 1 段肯定（能做的更多），第 3 段指出难点（如何流动难定），第 4 段说新方法正在解决——有肯定、有保留。',
   trap:['A：与第 3 段的 harder to establish 矛盾。','C：化学方法没被质疑。','D：与末段的意义阐述相反。'],
   guess:'先砍掉"完全""毫无"这类极端项，剩下"肯定 + 指出不足"的那项。',
   l2:'把第 1 段的 do more than 和第 3 段的 harder to establish 合起来看。',hot:4}
 ]
});

/* ================= R09 算法会偏见吗 ================= */
B.readings.push({
 id:'R09', title:'When the Model Discriminates', topic:'科技 · 社会', words:240, src:'仿真', level:2,
 text:[
  ["When a large technology company abandoned an automated recruitment tool in 2018, the reason was not that it failed to work. It worked, in the narrow sense, and that was the problem: the system had learned to penalise candidates whose résumés contained the word \"women's\", and it had learned this from ten years of the company's own hiring records.",
   "当一家大型科技公司在 2018 年弃用一套自动招聘工具时，原因并不是它不好用。在狭义上它是好用的，而这恰恰是问题所在：这套系统学会了惩罚简历里含有 women's 这个词的候选人，而它是从该公司自己十年的招聘记录里学到这一点的。"],
  ["The case is often cited as evidence that algorithms are biased, but the more accurate description is that they are faithful. A model trained on past outcomes will reproduce the patterns in those outcomes, including the ones nobody would defend. Bias enters as data long before it appears as code.",
   "这个案例常被引用为算法有偏的证据，但更准确的说法是它们很忠实。一个用过去结果训练出来的模型会复现这些结果里的模式，包括那些没人会为之辩护的模式。偏见是在作为代码出现之前，早就作为数据进入的。"],
  ["This makes the familiar demand for neutrality hard to satisfy. To build a hiring model one must first decide what a good employee is, and every available proxy — tenure, performance rating, promotion speed — carries the assumptions of the organisation that produced it. The choice of proxy is a moral decision presented in the vocabulary of optimisation.",
   "这让那种常见的「要中立」的要求难以满足。要建一个招聘模型，首先必须定义什么是好员工，而每一个可用的替代指标——在职时长、绩效评级、晋升速度——都带着产生它的那个组织的假设。选择替代指标，是一个用优化术语包装起来的道德决定。"],
  ["Regulators have begun to respond. Several jurisdictions now require impact assessments for automated decisions in employment and credit, and a few demand that the criteria be disclosed to the people affected. Disclosure has limits — a model with millions of parameters cannot be explained to an applicant — but it at least converts an invisible process into one that can be challenged.",
   "监管者已经开始回应。若干司法辖区现在要求对雇佣和信贷领域的自动决策做影响评估，少数还要求向受影响的人披露标准。披露有其局限——一个拥有数百万参数的模型无法向求职者解释清楚——但它至少把一个不可见的过程变成了一个可以被质疑的过程。"],
  ["What the debate keeps returning to is responsibility. An algorithm cannot be accused of prejudice, and holding it accountable would be a category mistake; the people who chose the data, the objective and the threshold can. Automating a decision does not transfer the obligation to justify it.",
   "这场争论不断回到的是责任。算法不能被指控怀有偏见，让它承担责任是一种范畴错误；选择数据、目标函数和阈值的人可以。把一个决策自动化，并不会把为它辩护的义务一并转移出去。"]
 ],
 qs:[
  {n:1,type:'main',q:'文章主要讨论的是：',
   o:['自动招聘工具的技术原理','算法偏见的来源、监管与责任归属','各国关于人工智能的立法比较','绩效评级方法的优劣'],
   a:1,
   loc:'Bias enters as data long before it appears as code ... Regulators have begun to respond ... What the debate keeps returning to is responsibility',
   locZh:'偏见是在作为代码出现之前，早就作为数据进入的……监管者已经开始回应……这场争论不断回到的是责任',
   why:'结构：案例（第 1 段）→ 偏见的来源（第 2 段）→ 中立为何难（第 3 段）→ 监管（第 4 段）→ 责任（第 5 段）。B 把后四段串起来了。',
   trap:['A：技术原理不是重点，文章谈的是偏见与责任。','C：只对应第 4 段。','D：绩效评级只是第 3 段举的一个替代指标。'],
   guess:'C、D 都只对应某一段，A 是全文没展开的技术层面。B 里的"来源/监管/责任"正好对应三个主体段落。',
   l2:'抓第 2 段的 faithful、第 4 段的 Regulators、第 5 段的 responsibility，三个关键词就是提纲。',hot:5},
  {n:2,type:'detail',q:'2018 年那套招聘工具的问题出在哪？',
   o:['它运行得太慢','它从公司过去十年的招聘记录里学到了惩罚女性候选人的倾向','它完全无法运行','它拒绝处理含有女性字样的简历'],
   a:1,
   loc:'learned to penalise candidates whose résumés contained the word "women\'s" ... from ten years of the company\'s own hiring records',
   locZh:'学会了惩罚简历里含有 women\'s 这个词的候选人……从该公司自己十年的招聘记录里',
   why:'两个信息都要有：惩罚含 women s 的简历 + 学自十年记录。只有 B 两者齐全。',
   trap:['A、C：与"它是好用的"矛盾。','D：penalise 不等于 reject，且少了"学自记录"这层原因。'],
   guess:'细节题要找"信息最完整"的那项：只说一半的（D）往往是陷阱，把现象和原因都写出来的更可能是答案。',
   l2:'定位第 1 段末，找 penalise 和 learned this from。',hot:5},
  {n:3,type:'meaning',q:'第 2 段中的 "faithful" 最接近：',
   o:['忠诚可靠的','如实复现（训练数据里的模式）','公正无私的','精确无误的'],
   a:1,
   loc:'A model trained on past outcomes will reproduce the patterns in those outcomes',
   locZh:'一个用过去结果训练出来的模型会复现这些结果里的模式',
   why:'下一句就是解释：忠实 = 如实复现训练数据里的模式（包括坏的）。考的是"忠实"在这里的特殊含义。',
   trap:['A：faithful 常见义是忠诚，但主语是模型、语境是复现数据。','C：与"包括没人会辩护的模式"矛盾。','D：精确不等于忠实复现偏见。'],
   guess:'词义题答案八成在下一句的解释里。看到 reproduce the patterns，就知道 faithful 说的是"复现"而非"忠诚"。',
   l2:'定位第 2 段第二句，冒号/破折号后的 reproduce 就是解释。',hot:5},
  {n:4,type:'infer',q:'作者认为「要算法保持中立」之所以难以实现，是因为：',
   o:['模型参数太多无法解释','必须先定义什么是好员工，而每个替代指标都带有组织的假设','监管机构立法太慢','数据量不足以训练模型'],
   a:1,
   loc:'one must first decide what a good employee is, and every available proxy ... carries the assumptions of the organisation',
   locZh:'首先必须定义什么是好员工，而每一个可用的替代指标……都带着产生它的那个组织的假设',
   why:'B 是原句的同义改写：定义好员工（价值判断）+ 指标带假设。',
   trap:['A：那是第 4 段说"披露有局限"时的理由，不是中立难以实现的原因。','C、D：原文未提及。'],
   guess:'推断题正确项必是原文改写。注意别把别处的理由搬过来（A 就是第 4 段的内容）。',
   l2:'定位第 3 段第二句 To build a hiring model one must first decide。',hot:5},
  {n:5,type:'attitude',q:'作者最可能同意下列说法中的哪一条？',
   o:['算法本身应当为歧视承担法律责任','自动化决策不会把为其辩护的义务转移出去','披露模型参数足以解决偏见问题','应当停止在招聘中使用算法'],
   a:1,
   loc:'Automating a decision does not transfer the obligation to justify it',
   locZh:'把一个决策自动化，并不会把为它辩护的义务一并转移出去',
   why:'末句直接给出：义务没有转移。B 几乎就是原句。',
   trap:['A：与"算法不能被指控""是范畴错误"直接矛盾。','C：第 4 段说披露"有其局限"。','D：作者从未主张停用，只主张可质疑。'],
   guess:'A 是极端且原文明确否定的，C 的"足以"、D 的"停止"也都过头。只剩 B 这种留有余地的表述。',
   l2:'态度题重点看末段：a category mistake 和 cannot transfer the obligation。',hot:4}
 ]
});

/* ================= 选词填空 C02 ================= */
B.cloze.push({
 id:'C02', title:'What Sleep Does to Memory', topic:'科普 · 生理', words:246,
 words15:['compensate','considerable','consolidate','constitute','deficiency','demonstrate','derive','disrupt','distinct','deteriorate','diverse','dominant','nevertheless','subsequent','whereas'],
 text:`Sleep is not a pause in which the brain switches off. Work over the past two decades has helped to {{26}} that memory depends on it: information acquired during the day is replayed and {{27}} during the hours that follow, and this process appears to {{28}} one of the main reasons sleep exists at all.

Two {{29}} stages seem to matter. Slow-wave sleep, which dominates the first half of the night, is associated with the transfer of facts from temporary to longer-term storage. REM sleep, which becomes {{30}} in the early morning, is more closely linked to the integration of new material with what is already known. Cutting either stage selectively impairs the corresponding kind of memory.

The consequences of {{31}} are therefore not confined to tiredness. Participants deprived of sleep for a single night perform markedly worse on {{32}} recall tests, and the deficit is not evenly spread: emotionally neutral material suffers less than material the participant had been asked to remember deliberately. This suggests that the effects of lost sleep are not uniform: rather than weakening memory as a whole, they {{33}} the particular operations that consolidation requires.

Older adults illustrate the pattern from another direction. Their sleep becomes lighter and more fragmented with age, and their performance on memory tasks tends to {{34}} in parallel. Whether the first causes the second remains unclear — poor sleep and cognitive decline may {{35}} from a common underlying cause — but the association is strong enough that sleep is now treated as a modifiable factor rather than a symptom.`,
 ans:{26:'demonstrate',27:'consolidate',28:'constitute',29:'distinct',30:'dominant',31:'deficiency',32:'subsequent',33:'disrupt',34:'deteriorate',35:'derive'},
 note:'先标词性：15 个词里 8 个动词、5 个形容词、2 个名词。10 个空里 6 个要动词，先解决它们，剩下的靠搭配定。第 30 空前是 becomes，后面只能接形容词；第 35 空 derive from 是固定搭配。'
});

/* ================= 长篇匹配 M02 ================= */
B.matching = B.matching || [];
B.matching.push({
 id:'M02', title:'Why Forecasts Fail', topic:'经济 · 心理',
 paras:[
  {k:'A',t:'Forecasting has become an industry, and its record is mixed. In fields as different as weather, elections and commodity prices, some predictions are now strikingly accurate. In others, published forecasts for the same year have been wrong by margins that ought to have ended careers.'},
  {k:'B',t:'The first reason is structural. A forecast is a statement about the future derived from a model of the past, and it can only be as good as the assumptions built into that model. When the relationships that held in the sample break down, accuracy deteriorates precisely at the moment it is most needed.'},
  {k:'C',t:'The second reason is social. Forecasters are rarely judged on their errors but on whether they agreed with everyone else. A number close to the consensus is safe whatever happens; a number far from it is a career risk. This asymmetry encourages clustering, so that an entire profession can be wrong together without anyone being blamed for it.'},
  {k:'D',t:'A third factor, easily overlooked, is that forecasts change the world they describe. A widely publicised prediction of a shortage can provoke the stockpiling that produces the shortage. The feedback may be beneficial, as when a warning of flooding prompts defences that prevent it, or destructive, as when a rumour of a bank\'s weakness causes the run that destroys it.'},
  {k:'E',t:'There is also the question of what counts as a good forecast. Being close on average is not the same as being reliable. A method that is accurate in ordinary conditions and catastrophically wrong in the tail is worse, for most purposes, than one that is slightly less accurate but never fails badly. Most published comparisons nevertheless score forecasts by average error, which conceals exactly this distinction.'},
  {k:'F',t:'Organisations typically respond by demanding more data, as though the deficiency were one of measurement. It seldom is. Adding variables to a model whose underlying structure is unstable does not restore accuracy; it increases confidence without improving the forecast, a phenomenon that has been demonstrated repeatedly in experimental settings.'},
  {k:'G',t:'A more promising response is to forecast less. Many decisions do not require a number; they require a range and a plan for being wrong. Insurers, who must price rare events, have long worked this way: rather than predicting whether a particular building will burn, they estimate the proportion of buildings that will, and hold reserves accordingly.'},
  {k:'H',t:'Incentives matter more than methods. Where forecasters are rewarded for accuracy alone, and not for the confidence of their claims, the quality of published predictions improves. Several central banks now publish the full distribution of their expectations, which makes an overconfident claim visible in advance and therefore costly.'},
  {k:'I',t:'The hardest problem is political. A forecast that a policy will fail is inconvenient for whoever proposed the policy, and the temptation to restrict or reinterpret it is considerable. Where the agency producing the forecasts depends on the government being assessed, an optimistic bias is not a scandal but a predictable outcome.'},
  {k:'J',t:'Technology has altered the terrain without settling the argument. Machine learning has improved short-horizon prediction in domains with abundant data and stable rules, and has done remarkably little in domains where the structure shifts. The distinction between the two has become one of the most useful things a decision-maker can learn.'},
  {k:'K',t:'The honest conclusion is that some futures are knowable and some are not, and that the difference is rarely announced. The practical skill is not to find a better crystal ball but to ask, of any number offered, what would have to be true for it to be wrong, and how soon one would find that out.'}
 ],
 qs:[
  {n:46,q:'Predictions built on past relationships fail once those relationships change.',a:'B'},
  {n:47,q:'A forecaster who departs from the common view risks more than one who is wrong along with everyone else.',a:'C'},
  {n:48,q:'A prediction may itself bring about the outcome it announced.',a:'D'},
  {n:49,q:'Judging forecasts by average error hides the rare but catastrophic miss.',a:'E'},
  {n:50,q:'Collecting more information can raise confidence without raising quality.',a:'F'},
  {n:51,q:'For some decisions an estimated range is more useful than a single figure.',a:'G'},
  {n:52,q:'Rewarding correctness rather than certainty improves the forecasts that get published.',a:'H'},
  {n:53,q:'Optimism is to be expected when the forecaster is paid by the body being judged.',a:'I'},
  {n:54,q:'Automated methods help most where rules are stable and data plentiful.',a:'J'},
  {n:55,q:'What matters is asking what would prove a forecast wrong, and when.',a:'K'}
 ],
 note:'段落 A 是引子（并不配题，是干扰段）。匹配题的正确做法：先读 10 个题干，各划出 1–2 个独特名词，再回段落扫同义改写。本题里 B/C/D/E/F/G/H/I/J/K 十个段落对应十道题，A 无对应。'
});
})();
