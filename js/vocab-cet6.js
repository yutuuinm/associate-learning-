/* 六级核心词库 + 高频词文章
   词表格式 {w, d, f}  f 为频度档：1 高频（先背）2 中频 3 低频
   文章结构与仔细阅读一致，可直接复用练习引擎 */
window.CET6 = window.CET6 || {};
window.CET6.VC = { name:'六级', words:[], passages:[] };

(function(){
var W = window.CET6.VC.words;
function add(list, f){
  list.forEach(function(x){
    var i = x.indexOf('|');
    W.push({w:x.slice(0,i), d:x.slice(i+1), f:f});
  });
}

/* ============ 1 档：高频 ============ */
add([
 'abandon|v. 放弃、抛弃','abnormal|adj. 反常的、异常的','absorb|v. 吸收；使专心',
 'abstract|adj. 抽象的 n. 摘要','absurd|adj. 荒谬的、荒唐的','abundant|adj. 丰富的、充裕的',
 'accelerate|v. 加速、促进','access|n. 使用权、通道 v. 进入','accommodate|v. 容纳；适应',
 'accompany|v. 陪伴；伴随','accomplish|v. 完成、实现','accumulate|v. 积累、积聚',
 'accurate|adj. 准确的','accuse|v. 指控','acknowledge|v. 承认；致谢',
 'acquire|v. 获得、习得','adapt|v. 适应；改编','adequate|adj. 足够的、适当的',
 'adjust|v. 调整、适应','administration|n. 管理、行政','admit|v. 承认；准许进入',
 'adopt|v. 采用；收养','advance|n./v. 前进、进展','advantage|n. 优势',
 'adverse|adj. 不利的、相反的','advocate|v. 提倡 n. 倡导者','affect|v. 影响',
 'afford|v. 负担得起；提供','agency|n. 机构、代理处','aggressive|adj. 好斗的；积极进取的',
 'alleviate|v. 减轻、缓解','allocate|v. 分配','alter|v. 改变',
 'ambiguous|adj. 模棱两可的','ambitious|adj. 有雄心的','analyze|v. 分析',
 'ancient|adj. 古代的','anticipate|v. 预料、预期','anxiety|n. 焦虑；渴望',
 'apparent|adj. 明显的；表面的','appeal|v./n. 呼吁；吸引力','appliance|n. 器具、电器',
 'appreciate|v. 欣赏；感激','approach|n. 方法 v. 接近','appropriate|adj. 恰当的',
 'approve|v. 批准；赞成','arbitrary|adj. 任意的；专断的','arise|v. 出现、产生',
 'aspect|n. 方面','assemble|v. 集合；装配','assess|v. 评估',
 'assign|v. 分配；指派','assist|v. 协助','associate|v. 联想 n. 伙伴',
 'assume|v. 假定；承担','assure|v. 使确信、保证','astonish|v. 使惊讶',
 'attach|v. 附上；重视','attain|v. 达到、获得','attempt|n./v. 尝试',
 'attribute|v. 归因于 n. 属性','authority|n. 权威；当局','available|adj. 可获得的',
 'aware|adj. 意识到的','beneficial|adj. 有益的','bias|n. 偏见',
 'boom|n./v. 繁荣、激增','boost|v. 促进、推动','burden|n. 负担'
], 1);

add([
 'campaign|n. 运动、战役','capable|adj. 有能力的','capacity|n. 容量；能力',
 'category|n. 种类、类别','cease|v. 停止','circumstance|n. 情况、环境',
 'cite|v. 引用','clarify|v. 澄清、阐明','coherent|adj. 连贯的',
 'collapse|v./n. 倒塌；崩溃','commodity|n. 商品','compel|v. 强迫',
 'compensate|v. 补偿','competent|adj. 胜任的','comprehensive|adj. 全面的',
 'comprise|v. 包含、由…组成','conceive|v. 构想','concentrate|v. 集中；专心',
 'conclude|v. 得出结论；结束','condemn|v. 谴责','conduct|n. 行为 v. 实施',
 'confine|v. 限制','confirm|v. 确认、证实','conflict|n. 冲突',
 'confront|v. 面对','consequence|n. 后果','conservative|adj. 保守的',
 'considerable|adj. 相当大的','consist|v. 组成；在于','constant|adj. 不断的',
 'constitute|v. 构成','consult|v. 咨询；查阅','consume|v. 消耗',
 'contemporary|adj. 当代的','context|n. 语境、背景','contradict|v. 反驳；矛盾',
 'contrary|adj. 相反的','contribute|v. 贡献；促成','controversial|adj. 有争议的',
 'conventional|adj. 传统的','convey|v. 传达','convince|v. 使信服',
 'crucial|adj. 至关重要的','decline|n./v. 下降；婉拒','dedicate|v. 奉献',
 'deficiency|n. 缺乏、不足','deliberate|adj. 蓄意的','demonstrate|v. 证明；演示',
 'depict|v. 描绘','deprive|v. 剥夺','derive|v. 得到；源于',
 'despite|prep. 尽管','deteriorate|v. 恶化','diminish|v. 减少',
 'discipline|n. 学科；纪律','discriminate|v. 歧视；区别','disrupt|v. 扰乱',
 'distinct|adj. 截然不同的','distort|v. 歪曲','distribute|v. 分发',
 'diverse|adj. 多样的','dominant|adj. 占主导的','dramatic|adj. 显著的'
], 1);

/* ============ 2 档：中频 ============ */
add([
 'durable|adj. 耐用的','dynamic|adj. 动态的；有活力的','efficient|adj. 高效的',
 'elaborate|adj. 详尽的 v. 详述','eliminate|v. 消除','embrace|v. 拥抱；接受',
 'emerge|v. 出现','emphasize|v. 强调','empirical|adj. 实证的',
 'enable|v. 使能够','encounter|v./n. 遭遇','endure|v. 忍受；持续',
 'enhance|v. 提高、增强','enormous|adj. 巨大的','ensure|v. 确保',
 'enterprise|n. 企业；事业','entitle|v. 赋予权利','equivalent|adj. 等价的',
 'establish|v. 建立','estimate|v./n. 估计','ethical|adj. 道德的',
 'evaluate|v. 评价','evident|adj. 明显的','evolve|v. 演变',
 'exaggerate|v. 夸大','exceed|v. 超过','exceptional|adj. 杰出的；例外的',
 'exclusive|adj. 独有的','execute|v. 执行','expand|v. 扩大',
 'expertise|n. 专长','explicit|adj. 明确的','exploit|v. 剥削；开发',
 'expose|v. 暴露；使接触','extend|v. 延伸','external|adj. 外部的',
 'facilitate|v. 促进、使便利','faculty|n. 全体教员；能力','feasible|adj. 可行的',
 'federal|adj. 联邦的','flourish|v. 繁荣','fluctuate|v. 波动',
 'formulate|v. 制定；阐述','foster|v. 培养','fragile|adj. 脆弱的',
 'framework|n. 框架','fulfill|v. 实现、履行','fundamental|adj. 根本的',
 'generate|v. 产生','genuine|adj. 真正的；真诚的','gradual|adj. 逐渐的',
 'grant|v. 授予 n. 拨款','grasp|v./n. 抓住；理解','hamper|v. 妨碍',
 'harsh|adj. 严厉的；恶劣的','hierarchy|n. 等级制度','hinder|v. 阻碍',
 'hypothesis|n. 假设','identical|adj. 完全相同的','ignorance|n. 无知',
 'illuminate|v. 照亮；阐明','imitate|v. 模仿','immense|adj. 巨大的',
 'immune|adj. 免疫的；免除的','implement|v. 实施','imply|v. 暗示'
], 2);

add([
 'impose|v. 强加','impress|v. 使印象深刻','impulse|n. 冲动',
 'incidence|n. 发生率','incline|v. 倾向','incorporate|v. 合并',
 'indicate|v. 表明','indispensable|adj. 不可或缺的','induce|v. 引起',
 'inevitable|adj. 不可避免的','infer|v. 推断','inherent|adj. 固有的',
 'inhibit|v. 抑制','initiate|v. 发起','innovation|n. 创新',
 'insight|n. 洞察力','inspire|v. 激励','institute|n. 研究所 v. 设立',
 'instrument|n. 仪器；手段','integrate|v. 整合','integrity|n. 正直；完整',
 'intense|adj. 强烈的','interfere|v. 干涉','intervene|v. 干预',
 'intimate|adj. 亲密的','intricate|adj. 错综复杂的','intrinsic|adj. 内在的',
 'isolate|v. 隔离','justify|v. 证明…正当','legitimate|adj. 合法的',
 'leverage|n. 杠杆 v. 利用','literacy|n. 读写能力','mainstream|n. 主流',
 'mandatory|adj. 强制的','manipulate|v. 操纵','margin|n. 边缘；差额',
 'mature|adj. 成熟的','maximize|v. 最大化','mechanism|n. 机制',
 'mediate|v. 调解','merge|v. 合并','migrate|v. 迁移',
 'military|adj. 军事的','minimal|adj. 最小的','minimize|v. 最小化',
 'moderate|adj. 适度的 v. 缓和','modify|v. 修改','monitor|v. 监控 n. 显示器',
 'monopoly|n. 垄断','moral|adj. 道德的 n. 寓意','motivate|v. 激励',
 'mutual|adj. 相互的','narrative|n. 叙述','neglect|v./n. 忽视',
 'negotiate|v. 谈判','nevertheless|adv. 然而','nominal|adj. 名义上的'
], 2);

/* ============ 3 档：低频查漏 ============ */
add([
 'notion|n. 概念、观念','notorious|adj. 臭名昭著的','nourish|v. 滋养',
 'nurture|v. 培育','obscure|adj. 模糊的；不知名的','observe|v. 观察；遵守',
 'obstacle|n. 障碍','obtain|v. 获得','obvious|adj. 明显的',
 'occasion|n. 场合；时机','occupy|v. 占据；使忙碌','offset|v. 抵消',
 'ongoing|adj. 持续的','opponent|n. 对手','oppose|v. 反对',
 'optimistic|adj. 乐观的','orientation|n. 方向；迎新','originate|v. 起源于',
 'outcome|n. 结果','outstanding|adj. 杰出的','overcome|v. 克服',
 'overlook|v. 忽视；俯瞰','oversee|v. 监督','overwhelm|v. 压倒、使不知所措',
 'paradox|n. 悖论、矛盾','parallel|adj. 平行的；类似的','parameter|n. 参数',
 'participate|v. 参与','particular|adj. 特定的；讲究的','passive|adj. 被动的',
 'perceive|v. 感知、视为','permanent|adj. 永久的','permeate|v. 渗透',
 'persist|v. 坚持；持续','perspective|n. 视角','persuade|v. 说服',
 'phenomenon|n. 现象','philosophy|n. 哲学；理念','pioneer|n. 先驱 v. 开创',
 'plausible|adj. 貌似合理的','ponder|v. 沉思','potential|adj. 潜在的 n. 潜力',
 'practicable|adj. 切实可行的','precede|v. 先于','precise|adj. 精确的',
 'predecessor|n. 前任、前身','predominant|adj. 占优势的','prejudice|n. 偏见',
 'preliminary|adj. 初步的','premise|n. 前提','preoccupy|v. 使全神贯注',
 'prevail|v. 盛行；获胜','prevalent|adj. 普遍的','previous|adj. 先前的',
 'primary|adj. 主要的；初级的','primitive|adj. 原始的','principal|adj. 主要的 n. 校长',
 'prior|adj. 在前的（prior to）','privilege|n. 特权','probe|v. 探查 n. 探针',
 'proceed|v. 继续进行','proclaim|v. 宣布','proficient|adj. 熟练的'
], 3);

/* ============ 高频词文章 ============ */
var P = window.CET6.VC.passages;
P.push({
  id:'C61', title:'为什么我们总高估自己的理解', kind:'reading', words:206, level:1,
  text:[
   ['Most of us assume that exposure to information automatically produces understanding.','我们大多数人假定，接触信息会自动带来理解。'],
   ['A simple experiment suggests that this assumption is far more ambiguous than it appears.','一项简单的实验表明，这个假定远比它看起来的要模糊。'],
   [' volunteers were asked to read a short article and then to predict how well they could explain the mechanisms it described.','志愿者被要求读一篇短文，然后预测自己能多好地解释文中描述的机制。'],
   ['Nearly everyone asserted confidently that they had acquired a genuine grasp of the subject.','几乎每个人都自信地断言，自己已经真正掌握了这个主题。'],
   ['When invited to articulate the actual process, however, roughly half could not proceed beyond vague generalities.','然而当被要求清晰说出实际过程时，大约一半人无法超越含糊的泛泛之谈。'],
   ['The gap arises because familiarity is routinely mistaken for comprehension.','这一差距的出现，是因为熟悉感被惯常地误当成理解。'],
   ['Abundant exposure to a topic can therefore create an illusion of knowledge that is remarkably durable.','因此，大量接触某个话题会制造出一种异常持久的知识幻觉。'],
   ['Such an illusion is not harmless, since people who believe they already understand seldom endeavor to verify their assumptions.','这种幻觉并非无害，因为自认为已经理解的人极少去努力验证自己的假定。'],
   ['Educators consequently advocate frequent self-testing, which compels learners to confront what they cannot actually explain.','因此教育者提倡频繁的自我测试，这迫使学习者直面自己其实解释不了的东西。'],
   ['The implications extend beyond the classroom: institutions that assess competence on the basis of confident performance may be rewarding appearance rather than substance.','其影响超出课堂：依据自信表现来评估能力的机构，可能是在奖励表象而非实质。']
  ],
  qs:[
   {n:1,type:'main',q:'文章主要说明的是：',o:['获取信息的渠道正变得越来越多','人们常把熟悉误当成理解，因此需要自我检测','实验方法本身存在严重缺陷','教育机构应当减少信息投放'],
    a:1,l2:'看第 4 段「The gap arises because…」以及第 6 段教育者的建议。',
    loc:'The gap arises because familiarity is routinely mistaken for comprehension.',
    locZh:'这一差距的出现，是因为熟悉感被惯常地误当成理解。',
    why:'全文链条：现象（预测与实际不符）→ 成因（熟悉≠理解）→ 后果（幻觉有害）→ 对策（自我测试）。B 完整覆盖。A、C、D 都是局部或无关。',hot:5},
   {n:2,type:'meaning',q:'第 3 段中的 "articulate" 最接近：',o:['清楚地讲出','争论、反驳','重复、背诵','质疑'],
    a:0,l2:'定位第 3 段，看后半句 "vague generalities"。',
    loc:'roughly half could not proceed beyond vague generalities',
    locZh:'大约一半人无法超越含糊的泛泛之谈。',
    why:'做不到 articulate 的人只能说出 vague generalities（含糊之辞），两者构成反义对照，故 articulate = 清楚讲出。',hot:5},
   {n:3,type:'detail',q:'实验中大约多少人无法真正解释所学内容？',o:['不到四分之一','大约一半','超过八成','全部'],
    a:1,l2:'定位第 3 段的数量表达。',
    loc:'roughly half could not proceed beyond vague generalities',
    locZh:'大约一半人无法超越含糊的泛泛之谈。',
    why:'roughly half = 大约一半。A、C 是典型数量陷阱，回原文核对即可。',hot:5},
   {n:4,type:'infer',q:'自我测试之所以有用，是因为它：',o:['能让人学得更快','迫使学习者暴露自己解释不了的东西','大幅缩短学习时间','提高长期记忆'],
    a:1,l2:'定位第 6 段 "compels learners to confront..."。',
    loc:'which compels learners to confront what they cannot actually explain',
    locZh:'这迫使学习者直面自己其实解释不了的东西。',
    why:'confront what they cannot explain = 暴露解释不了的部分，是同义改写。其余三项原文未提及。',hot:5},
   {n:5,type:'attitude',q:'作者对「接触信息即产生理解」的态度是：',o:['完全赞同','有所保留、指出其问题','强烈否定其一切价值','不置可否'],
    a:1,l2:'注意第 2 段的 "far more ambiguous than it appears"。',
    loc:'this assumption is far more ambiguous than it appears',
    locZh:'这个假定远比它看起来的要模糊。',
    why:'作者指出假定过于简化（有问题），但并未主张它毫无价值（排除 C）。态度题先砍极端项，B 最贴合。',hot:4}
  ]
});

P.push({
  id:'C62', title:'效率越高，消耗越少吗', kind:'reading', words:204, level:2,
  text:[
   ['It is widely believed that technological innovation will inevitably alleviate the pressure on natural resources.','人们普遍相信，技术创新必将缓解对自然资源的压力。'],
   ['This belief deserves scrutiny, because efficiency gains frequently fail to reduce total consumption.','这一信念值得推敲，因为效率提升常常并未降低总消耗量。'],
   ['When a production process becomes more efficient, the cost of each unit declines and demand tends to expand accordingly.','当生产过程变得更高效，单位成本下降，需求往往随之扩张。'],
   ['Economists call this a rebound effect: the savings achieved are partly offset by increased use.','经济学家称之为回弹效应：所节省的部分被使用量的增加部分抵消。'],
   ['History supports the concern. Improvements in engine efficiency, for instance, did not curtail fuel consumption in the aggregate.','历史支持这一担忧。例如，发动机效率的提升并未在总体上削减燃料消耗。'],
   ['None of this implies that innovation is futile; it implies only that innovation alone cannot resolve the problem.','这些都不意味着创新是徒劳的；它只意味着单靠创新无法解决问题。'],
   ['Policies that constrain consumption directly, through quotas or pricing, address the mechanism efficiency leaves untouched.','通过配额或定价直接约束消费的政策，触及的正是效率所没有触及的机制。'],
   ['A comprehensive approach would therefore combine technical progress with deliberate limits on aggregate demand.','因此，综合的做法会把技术进步与对总需求的有意限制结合起来。'],
   ['Whether governments possess the resolve to impose such limits remains an open question.','各国政府是否具备施加这类限制的决心，仍是一个悬而未决的问题。']
  ],
  qs:[
   {n:1,type:'main',q:'文章的中心论点是：',o:['技术创新对资源问题毫无作用','单靠技术创新不够，还需配合需求限制','回弹效应是最严重的经济缺陷','政府应停止资助技术研发'],
    a:1,l2:'看第 6 段 "it implies only that..." 和第 8 段的 therefore。',
    loc:'it implies only that innovation alone cannot resolve the problem',
    locZh:'它只意味着单靠创新无法解决问题。',
    why:'A 被第 6 段 "None of this implies that innovation is futile" 明确否定；C、D 无依据。B 对应结论段的组合方案。',hot:5},
   {n:2,type:'meaning',q:'第 4 段中的 "offset" 最接近：',o:['加速、促进','抵消、弥补','记录、统计','估计'],
    a:1,l2:'定位第 4 段冒号后的解释。',
    loc:'the savings achieved are partly offset by increased use',
    locZh:'所节省的部分被使用量的增加部分抵消。',
    why:'被动结构「节省被用量增加 offset」，且结果是节省失效，只能是「抵消」。',hot:5},
   {n:3,type:'detail',q:'回弹效应指的是：',o:['效率提升导致成本上升','节省的部分被增加的使用量抵消','人口增长直接造成资源枯竭','政府配额导致市场萎缩'],
    a:1,l2:'定位第 4 段冒号后的定义。',
    loc:'Economists call this a rebound effect: the savings achieved are partly offset by increased use.',
    locZh:'经济学家称之为回弹效应：所节省的部分被使用量的增加部分抵消。',
    why:'原文冒号后直接给定义。A 与原文 cost declines 相反。',hot:5},
   {n:4,type:'infer',q:'作者举发动机的例子是为了说明：',o:['发动机技术仍有改进空间','历史上的效率提升确实降低了总消耗','效率提升未必带来总消耗下降，这有历史依据','燃料消耗与人口无关'],
    a:2,l2:'定位第 5 段，注意例子本身的否定表述。',
    loc:'did not curtail fuel consumption in the aggregate',
    locZh:'并未在总体上削减燃料消耗。',
    why:'例子为上一段的回弹效应提供历史证据。C 是原文的同义改写；B 与之相反。',hot:5},
   {n:5,type:'attitude',q:'作者对「直接约束消费的政策」的态度是：',o:['完全不可行','认为有必要，但对落实存疑','会严重损害创新','与资源问题无关'],
    a:1,l2:'看第 7 段的正面评价 + 第 9 段的 open question。',
    loc:'Whether governments possess the resolve to impose such limits remains an open question.',
    locZh:'各国政府是否具备施加这类限制的决心，仍是一个悬而未决的问题。',
    why:'第 7 段肯定其触及了效率未触及的机制（有必要），第 9 段说政府决心存疑。合起来是 B。',hot:4}
  ]
});

P.push({
  id:'C63', title:'匿名评审的代价', kind:'reading', words:210, level:3,
  text:[
   ['Peer review is usually presented as the mechanism that guarantees the reliability of published research.','同行评审通常被描述为保证已发表研究可靠性的机制。'],
   ['Its defenders contend that scrutiny by independent experts filters out error and deters careless work.','它的辩护者主张，独立专家的审查能滤除错误并遏止粗心的工作。'],
   ['Critics, however, point to a persistent anomaly: the process is far less consistent than its reputation implies.','然而批评者指出一个长期存在的反常现象：这一过程远不如其名声所暗示的那样稳定。'],
   ['The same paper sent to different reviewers may receive evaluations that diverge sharply.','同一篇论文送给不同评审人，可能得到差异极大的评价。'],
   ['Anonymity, introduced to protect reviewers from retaliation, also diminishes accountability.','为保护评审人免遭报复而引入的匿名制，同时也削弱了问责。'],
   ['A reviewer who need not sign a report faces weaker incentives to scrutinize the work thoroughly.','不必在评审意见上署名的评审人，缺乏彻底审查该工作的足够动力。'],
   ['Several journals have consequently experimented with open review, in which reports appear alongside the article.','因此一些期刊尝试了公开评审，即评审意见与文章一同发表。'],
   ['Early results are suggestive rather than conclusive: reports do become more courteous, though not necessarily more rigorous.','早期结果具有启发性而非决定性：评审意见确实变得更客气，却未必更严格。'],
   ['The deeper difficulty is that no system can fully eliminate subjective judgment from evaluation.','更深层的困难在于，没有任何制度能完全消除评价中的主观判断。'],
   ['What reform can accomplish is to make that judgment visible, and therefore open to challenge.','改革所能做到的，是让这种判断变得可见，从而可被质疑。']
  ],
  qs:[
   {n:1,type:'main',q:'文章主要探讨：',o:['如何成为合格的评审人','同行评审的作用、局限与公开评审的尝试','学术出版的历史','匿名制应当被立即废除'],
    a:1,l2:'前两段讲作用，第 3 段 however 转向局限，第 7 段起讲尝试与结论。',
    loc:'the process is far less consistent than its reputation implies',
    locZh:'这一过程远不如其名声所暗示的那样稳定。',
    why:'D 是极端项，原文只说公开评审在试验中。B 覆盖「作用 → 局限 → 改革」这条主线。',hot:5},
   {n:2,type:'meaning',q:'第 3 段中的 "anomaly" 最接近：',o:['惯例','反常现象','优势','争议'],
    a:1,l2:'看冒号后的解释。',
    loc:'the process is far less consistent than its reputation implies',
    locZh:'这一过程远不如其名声所暗示的那样稳定。',
    why:'前两段建立「评审可靠」的预期，本段用 however + anomaly 打破它，故为「与预期不符的反常」。',hot:5},
   {n:3,type:'detail',q:'匿名制最初被引入的目的是：',o:['提高评审严格程度','保护评审人免遭报复','加快审稿速度','让作者更易接受'],
    a:1,l2:'定位第 5 段 "introduced to protect..."。',
    loc:'Anonymity, introduced to protect reviewers from retaliation, also diminishes accountability.',
    locZh:'为保护评审人免遭报复而引入的匿名制，同时也削弱了问责。',
    why:'原文直接给目的。后半句 "diminishes accountability" 是副作用，不是目的。',hot:5},
   {n:4,type:'infer',q:'关于公开评审的早期结果可推断：',o:['使评审明显更严格','彻底解决了主观判断问题','改善了态度但严格程度未必提升','导致评审人大量退出'],
    a:2,l2:'定位第 8 段 though 后的让步。',
    loc:'reports do become more courteous, though not necessarily more rigorous',
    locZh:'评审意见确实变得更客气，却未必更严格。',
    why:'more courteous = 态度改善；not necessarily more rigorous = 严格度未必提升。B 被第 9 段否定。',hot:5},
   {n:5,type:'attitude',q:'作者对同行评审改革的整体判断是：',o:['改革可消除主观判断','改革的价值在于让判断可见、可被质疑','改革毫无意义','改革会破坏学术自由'],
    a:1,l2:'看末两段，尤其第 10 段 What reform can accomplish。',
    loc:'What reform can accomplish is to make that judgment visible, and therefore open to challenge.',
    locZh:'改革所能做到的，是让这种判断变得可见，从而可被质疑。',
    why:'A 被第 9 段 "no system can fully eliminate" 直接否定；C、D 无依据。',hot:4}
  ]
});

P.push({
  id:'C64', title:'公司为什么反复重组', kind:'reading', words:212, level:2,
  text:[
   ['Few executives abandon a restructuring plan once they have announced it, because reversing course would signal that the original analysis was not accurate.',
    '很少有高管会在宣布重组计划后放弃它，因为改变方向会暗示原来的分析并不准确。'],
   ['What accompanies nearly every such announcement is a promise that the company will adapt quickly to adverse market conditions.',
    '几乎每一份这样的公告都伴随着一个承诺：公司会迅速适应不利的市场环境。'],
   ['Boards approve the plan after consultants assess whether the firm can absorb the costs without accumulating unsustainable debt.',
    '董事会在顾问评估了公司能否承担这些成本而不至于累积无法持续的债务之后，才会批准计划。'],
   ['The assumption that reorganizing will automatically accelerate growth is rarely examined, though evidence for it is far from adequate.',
    '「重组会自动加速增长」这一假定很少被检验，尽管支持它的证据远不充分。'],
   ['Managers who anticipate resistance often attempt to alter reporting lines before employees become aware of what is happening.',
    '预料到会有抵触的管理者，常常会在员工察觉之前就试图改变汇报关系。'],
   ['Authority is reassigned, tasks are renamed, and an administration that was once stable is suddenly expected to adjust to new routines.',
    '权力被重新分配，任务被重新命名，一度稳定的管理层突然被要求去适应新的流程。'],
   ['Critics argue that such changes are frequently arbitrary: the criteria by which performance is judged remain apparent only to those who designed them.',
    '批评者认为这类变动常常是任意的：评判绩效的标准只有设计它们的人才看得明白。'],
   ['A more appropriate response, they suggest, would be to adopt a narrower set of reforms and to evaluate them over a longer period.',
    '他们提出，更恰当的做法是采用范围更窄的一组改革，并用更长的时间来评估。'],
   ['Assisted by outside advisers, a few firms have attained genuine improvements; many others merely create the appearance of action.',
    '在外部顾问的协助下，少数公司取得了切实的改善；更多的公司只是制造了正在行动的观感。'],
   ['The affected employees, meanwhile, are left to decide whether the disruption was necessary or merely convenient for those at the top.',
    '与此同时，受影响的员工只能自己去判断：这场动荡究竟是必要的，还是仅仅方便了高层。']
  ],
  qs:[
   {n:1,type:'main',q:'文章主要讨论的是：',o:['公司重组带来的财务收益','企业重组的普遍做法以及它受到的质疑','咨询行业的兴起与乱象','员工如何应对组织变动'],
    a:1,l2:'看第 2 段的承诺、第 7 段的 Critics argue 和第 8 段的建议。',
    loc:'Critics argue that such changes are frequently arbitrary',
    locZh:'批评者认为这类变动常常是任意的。',
    why:'全文脉络：宣布重组→批准流程→隐含假定被质疑→更恰当的做法。B 概括了做法与质疑两面。A、C、D 都是局部信息。',hot:5},
   {n:2,type:'meaning',q:'第 7 段中的 "arbitrary" 最接近：',o:['随意的、缺乏依据的','严格执行的','反复修改的','秘密进行的'],
    a:0,l2:'定位第 7 段冒号后的解释：标准只有设计者才明白。',
    loc:'the criteria by which performance is judged remain apparent only to those who designed them',
    locZh:'评判绩效的标准只有设计它们的人才看得明白。',
    why:'冒号后是对 arbitrary 的解释——标准不透明、只对自己人清楚，即「随意、缺乏依据」。其余三项原文没有对应。',hot:5},
   {n:3,type:'detail',q:'董事会在批准重组计划之前通常会：',o:['立刻裁撤相关部门','请顾问评估公司能否承担成本','征求全体员工意见','公开全部财务细节'],
    a:1,l2:'定位第 3 段的 after（在……之后），答案在从句里。',
    loc:'after consultants assess whether the firm can absorb the costs without accumulating unsustainable debt',
    locZh:'在顾问评估了公司能否承担这些成本而不至于累积无法持续的债务之后',
    why:'approve 发生在 assess whether the firm can absorb the costs 之后，B 是原句的同义改写。A、C、D 均无依据。',hot:5},
   {n:4,type:'infer',q:'作者暗示重组之所以频繁被采用，部分原因是它：',o:['见效最快且成本最低','能制造「正在行动」的观感','受到员工普遍支持','是法律强制要求的'],
    a:1,l2:'定位第 9 段后半句 merely create the appearance of action。',
    loc:'many others merely create the appearance of action',
    locZh:'更多的公司只是制造了正在行动的观感。',
    why:'appearance of action = 看起来在做事，与 B 一致。A、C、D 原文均未提及，属常识性干扰。',hot:4},
   {n:5,type:'attitude',q:'作者对重组计划的态度是：',o:['充分肯定其成效','谨慎并质疑其效果','完全否定其一切价值','不置可否'],
    a:1,l2:'注意第 4 段 rarely examined、第 9 段 a few...many others 的对比。',
    loc:'Assisted by outside advisers, a few firms have attained genuine improvements; many others merely create the appearance of action.',
    locZh:'在外部顾问的协助下，少数公司取得了切实的改善；更多的公司只是制造了正在行动的观感。',
    why:'作者承认少数有效（排除 C），但指出多数只是观感，且核心假定从未被检验，故为「谨慎质疑」。A 与原文相反。',hot:4}
  ]
});

P.push({
  id:'C65', title:'广告到底在卖什么', kind:'reading', words:210, level:2,
  text:[
   ['Contemporary advertising rarely confines itself to describing a commodity; it concentrates instead on the circumstances in which owning it might matter.',
    '当代广告很少只限于描述一件商品；它把重点放在「在什么情境下拥有它才会有意义」上。'],
   ['A campaign that merely cites technical specifications seldom convinces anyone, because specifications convey little about daily life.',
    '仅仅引用技术参数的广告活动很少能说服任何人，因为参数几乎传达不出日常生活的样子。'],
   ['What consumers are asked to imagine is a constant state of improvement, in which every purchase contributes to a more coherent version of the self.',
    '消费者被要求去想象的，是一种持续的改善状态：每一次购买都在为一个更连贯的自我添砖加瓦。'],
   ['This promise is controversial, and the evidence is far from consistent: surveys conducted over two decades fail to confirm any lasting rise in well-being.',
    '这个承诺是有争议的，证据也远不一致：跨度二十年的调查并未能确认幸福感有持久的上升。'],
   ['Contrary to the assumption that affluence brings contentment, growth in consumption has coincided with a measurable increase in reported anxiety.',
    '与「富裕带来满足」这一假定相反，消费的增长与自陈焦虑的可测量上升同时发生。'],
   ['The consequence is a peculiar burden: people who are perfectly capable of meeting their needs feel compelled to keep expanding them.',
    '其后果是一种奇特的负担：完全有能力满足自己需求的人，却感到被迫不断扩张这些需求。'],
   ['Economists are conservative about such claims, noting that self-reported happiness is a category that resists precise comparison.',
    '经济学家对这类论断持保留态度，他们指出，自我报告的幸福感是一个难以精确比较的范畴。'],
   ['A competent critic would clarify the context first: most of the data come from wealthy countries and cannot be extended without qualification.',
    '一个称职的批评者会先厘清背景：大部分数据来自富裕国家，不加限定就无法外推。'],
   ['Nor does the argument condemn commerce itself; it questions only the belief that more of it will cease to disappoint.',
    '这一论证也并不谴责商业本身；它质疑的只是「更多消费就会停止令人失望」这一信念。'],
   ['What remains is a modest conclusion: advertising is most effective not when it informs, but when it confirms a wish that already exists.',
    '剩下的只是一个温和的结论：广告最有效的时候不是它提供信息，而是它确认了一个已经存在的愿望。']
  ],
  qs:[
   {n:1,type:'main',q:'文章的中心论点是：',o:['广告应当被全面禁止','广告靠塑造情境而非提供信息起作用，其效果值得怀疑','富裕国家的人普遍更焦虑','经济学研究不可靠'],
    a:1,l2:'看第 1 段的 confines/concentrates 对比，以及第 10 段的 conclusion。',
    loc:'advertising is most effective not when it informs, but when it confirms a wish that already exists',
    locZh:'广告最有效的时候不是它提供信息，而是它确认了一个已经存在的愿望。',
    why:'第 1 段给出机制（塑造情境），第 4 段给出质疑（证据不一致），第 10 段收束。B 两面都覆盖。A 被第 9 段明确否定，C、D 是局部或曲解。',hot:5},
   {n:2,type:'meaning',q:'第 3 段中的 "coherent" 最接近：',o:['一致的、连贯的','混乱的、破碎的','复杂的','短暂的'],
    a:0,l2:'看 coherent 修饰的对象 version of the self，以及「持续改善」的语境。',
    loc:'every purchase contributes to a more coherent version of the self',
    locZh:'每一次购买都在为一个更连贯的自我添砖加瓦。',
    why:'消费被描绘成持续改善（constant state of improvement），因此自我越来越「连贯一致」。B 与方向相反。',hot:5},
   {n:3,type:'detail',q:'经济学家对「消费增长带来幸福」这类结论持保留，是因为：',o:['他们反对消费本身','自我报告的幸福感难以精确比较','可用数据太少','他们受广告商资助'],
    a:1,l2:'定位第 7 段 noting that 后面的原因。',
    loc:'self-reported happiness is a category that resists precise comparison',
    locZh:'自我报告的幸福感是一个难以精确比较的范畴。',
    why:'resists precise comparison = 难以精确比较，B 直接对应。A、D 属动机揣测，C 与 two decades 的数据量矛盾。',hot:5},
   {n:4,type:'infer',q:'作者暗示广告最有效的时候是：',o:['价格降到最低时','确认了消费者已有愿望时','信息最详尽时','竞争对手最少时'],
    a:1,l2:'定位末段 not when...but when... 这组对照。',
    loc:'not when it informs, but when it confirms a wish that already exists',
    locZh:'不是它提供信息，而是它确认了一个已经存在的愿望。',
    why:'confirms a wish that already exists = 确认已有愿望。C 与 informs 对应但被 not 排除。',hot:4},
   {n:5,type:'attitude',q:'作者对广告的态度是：',o:['强烈谴责商业行为','冷静地、有限度地提出质疑','完全支持广告业','漠不关心'],
    a:1,l2:'看第 9 段的 Nor does the argument condemn，以及第 10 段的 modest conclusion。',
    loc:'Nor does the argument condemn commerce itself; it questions only the belief that more of it will cease to disappoint.',
    locZh:'这一论证也并不谴责商业本身；它质疑的只是「更多消费就会停止令人失望」这一信念。',
    why:'明确说不谴责商业、只质疑某一信念，且结论是 modest（温和的），故 B。A 与原文相反，D 与全文立场矛盾。',hot:4}
  ]
});
})();
