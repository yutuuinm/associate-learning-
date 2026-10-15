/* 考研英语核心词库 + 高频词文章
   词表格式 {w, d, f}  f 为频度档：1 高频（先背）2 中频 3 低频（查漏）
   文章走与仔细阅读相同的结构：text 为 [英文, 译文] 数组，qs 为题目 */
window.CET6 = window.CET6 || {};
window.CET6.VK = { name:'考研英语', words:[], passages:[] };

(function(){
var W = window.CET6.VK.words;
function add(list, f){
  list.forEach(function(x){
    var i = x.indexOf('|');
    W.push({w:x.slice(0,i), d:x.slice(i+1), f:f});
  });
}

/* ============ 1 档：高频（考研阅读/完形出现最密的一批） ============ */
add([
 'abandon|v. 放弃、抛弃','abide|v. 遵守（abide by）；忍受','abnormal|adj. 反常的、不正常的',
 'abolish|v. 废除、废止','abrupt|adj. 突然的；唐突的','absorb|v. 吸收；使全神贯注',
 'abstract|adj. 抽象的 n. 摘要','absurd|adj. 荒谬的、荒唐的','abundant|adj. 丰富的、充裕的',
 'academic|adj. 学术的','accelerate|v. 加速、促进','access|n. 通道、使用权 v. 进入',
 'accommodate|v. 容纳；适应；提供住宿','accompany|v. 陪伴；伴随','accomplish|v. 完成、实现',
 'accord|n. 协议 v. 符合（accord with）','accumulate|v. 积累、积聚','accurate|adj. 准确的',
 'accuse|v. 指控（accuse sb of）','acknowledge|v. 承认；致谢','acquire|v. 获得、习得',
 'adapt|v. 适应；改编','adequate|adj. 足够的、适当的','adjust|v. 调整、适应',
 'administration|n. 管理、行政；政府','admit|v. 承认；准许进入','adopt|v. 采用；收养',
 'advance|n./v. 前进、进展 adj. 预先的','advantage|n. 优势、有利条件','adverse|adj. 不利的、相反的',
 'advocate|v. 提倡 n. 倡导者','affect|v. 影响；感染','afford|v. 负担得起；提供',
 'aggressive|adj. 侵略的；积极进取的','alleviate|v. 减轻、缓解','allocate|v. 分配、拨给',
 'alter|v. 改变、改动','ambiguous|adj. 模棱两可的','ambition|n. 雄心、抱负',
 'amplify|v. 放大；详述','analyze|v. 分析','ancient|adj. 古代的',
 'anticipate|v. 预料、预期','anxiety|n. 焦虑；渴望','apparent|adj. 明显的；表面的',
 'appeal|v./n. 呼吁；上诉；吸引力','appliance|n. 器具、家用电器','apply|v. 应用；申请',
 'appreciate|v. 欣赏；感激；理解','approach|n. 方法 v. 接近、着手处理','appropriate|adj. 恰当的 v. 挪用',
 'approve|v. 批准；赞成','arbitrary|adj. 任意的；专断的','arise|v. 出现、产生（arise from）',
 'articulate|v. 清晰表达 adj. 口齿清楚的','aspect|n. 方面；外观','assemble|v. 集合；装配',
 'assert|v. 断言、主张','assess|v. 评估、评定','assign|v. 分配；指派',
 'assist|v. 协助、帮助','associate|v. 联想；交往 n. 伙伴','assume|v. 假定；承担；呈现',
 'assure|v. 使确信、保证','astonish|v. 使惊讶','attach|v. 附上；重视（attach importance to）',
 'attain|v. 达到、获得','attempt|n./v. 尝试、企图','attribute|v. 归因于 n. 属性',
 'authority|n. 权威；当局','available|adj. 可获得的、可用的','aware|adj. 意识到的'
], 1);

add([
 'ban|v./n. 禁止','barely|adv. 几乎不、勉强','behalf|n. 代表（on behalf of）',
 'beneficial|adj. 有益的','bias|n. 偏见 v. 使有偏见','bind|v. 捆绑；约束',
 'boom|n./v. 繁荣、激增','boost|v. 促进、推动','boundary|n. 边界、界限',
 'burden|n. 负担 v. 使负担','campaign|n. 运动、战役','capable|adj. 有能力的',
 'capacity|n. 容量；能力','category|n. 种类、类别','cease|v. 停止、终止',
 'circumstance|n. 情况、环境','cite|v. 引用、引证','civil|adj. 公民的；民事的',
 'clarify|v. 澄清、阐明','coherent|adj. 连贯的、一致的','coincide|v. 同时发生；一致',
 'collapse|v./n. 倒塌；崩溃','commodity|n. 商品、日用品','compel|v. 强迫、迫使',
 'compensate|v. 补偿、赔偿','competent|adj. 有能力的、胜任的','comprehensive|adj. 综合的、全面的',
 'comprise|v. 包含、由…组成','conceive|v. 构想；怀孕','concentrate|v. 集中；专心',
 'conclude|v. 得出结论；结束','condemn|v. 谴责；判刑','conduct|n. 行为 v. 实施；指挥',
 'confine|v. 限制、局限于','confirm|v. 确认、证实','conflict|n. 冲突 v. 抵触',
 'conform|v. 遵守、符合','confront|v. 面对、遭遇','consequence|n. 结果、后果',
 'conservative|adj. 保守的','considerable|adj. 相当大的','consist|v. 组成；在于',
 'constant|adj. 不断的；恒定的','constitute|v. 构成、组成','constrain|v. 限制、约束',
 'consult|v. 咨询；查阅','consume|v. 消耗；消费','contemporary|adj. 当代的；同时代的',
 'contend|v. 主张；竞争','context|n. 语境、上下文','contradict|v. 反驳；与…矛盾',
 'contrary|adj. 相反的 n. 相反','contribute|v. 贡献；促成','controversial|adj. 有争议的',
 'conventional|adj. 常规的、传统的','convey|v. 传达；运输','convince|v. 使信服'
], 1);

/* ============ 2 档：中频 ============ */
add([
 'correlate|v. 相关、关联','counterpart|n. 对应的人或物','crucial|adj. 至关重要的',
 'crude|adj. 粗糙的；未加工的','cumulative|adj. 累积的','curb|v./n. 抑制、控制',
 'deadline|n. 截止日期','decline|n./v. 下降；婉拒','dedicate|v. 奉献、致力于',
 'deficiency|n. 缺乏、不足','define|v. 定义、界定','deliberate|adj. 蓄意的；从容的',
 'demonstrate|v. 证明；演示；示威','denote|v. 表示、意味着','dense|adj. 密集的、稠密的',
 'depict|v. 描绘、描述','deprive|v. 剥夺（deprive of）','derive|v. 得到；源于',
 'designate|v. 指定、指派','despite|prep. 尽管','deteriorate|v. 恶化、变坏',
 'deter|v. 阻止、威慑','deviate|v. 偏离、背离','devote|v. 投入、奉献',
 'diminish|v. 减少、缩小','discipline|n. 学科；纪律 v. 训练','discourse|n.  discourse 话语、论述',
 'discriminate|v. 歧视；区别','displace|v. 取代；迫使离开','dispose|v. 处理；使倾向于',
 'dispute|n./v. 争论、纠纷','disrupt|v. 扰乱、打断','distinct|adj. 截然不同的；清晰的',
 'distort|v. 歪曲、曲解','distribute|v. 分发、分布','diverse|adj. 多样的、不同的',
 'dominant|adj. 占主导地位的','dramatic|adj. 显著的；戏剧性的','duplicate|v. 复制 n. 副本',
 'durable|adj. 持久的、耐用的','dynamic|adj. 动态的；有活力的','eccentric|adj. 古怪的',
 'ecological|adj. 生态的','efficient|adj. 高效的','elaborate|adj. 详尽的 v. 详尽阐述',
 'elicit|v. 引出、诱出','eligible|adj. 有资格的、合格的','eliminate|v. 消除、排除',
 'embark|v. 着手、开始（embark on）','embed|v. 嵌入、植入','embrace|v. 拥抱；接受',
 'emerge|v. 出现、浮现','emphasize|v. 强调','empirical|adj. 实证的、经验的',
 'enable|v. 使能够','encounter|v./n. 遭遇、遇到','endeavor|n./v. 努力、尽力',
 'endure|v. 忍受；持续','enhance|v. 提高、增强','enormous|adj. 巨大的',
 'enroll|v. 登记、注册','ensure|v. 确保、保证','entail|v. 需要、牵涉'
], 2);

add([
 'enterprise|n. 企业；事业','entitle|v. 赋予权利；命名','equivalent|adj. 等价的 n. 等价物',
 'erode|v. 侵蚀、腐蚀','escalate|v. 升级、逐步扩大','essence|n. 本质、实质',
 'establish|v. 建立、确立','estimate|v./n. 估计、估算','ethical|adj. 道德的、伦理的',
 'evaluate|v. 评价、评估','evident|adj. 明显的','evolve|v. 演变、进化',
 'exaggerate|v. 夸大、夸张','exceed|v. 超过、超越','exceptional|adj. 例外的；优秀的',
 'exclusive|adj. 独有的；排他的','execute|v. 执行；处决','exemplify|v. 例证、作为…的范例',
 'exert|v. 施加（影响等）','exhaust|v. 耗尽；使疲惫 n. 废气','exhibit|v. 展出；表现出 n. 展品',
 'expand|v. 扩大、膨胀','expenditure|n. 支出、开销','expertise|n. 专门知识、专长',
 'explicit|adj. 明确的、清楚的','exploit|v. 剥削；利用；开发','expose|v. 暴露；揭露；使接触',
 'extend|v. 延伸；扩展','external|adj. 外部的、外来的','extract|v. 提取、摘录',
 'facilitate|v. 促进、使便利','faculty|n. 全体教员；能力','fascinate|v. 使着迷',
 'feasible|adj. 可行的','federal|adj. 联邦的','flourish|v. 繁荣、兴旺',
 'fluctuate|v. 波动、起伏','formulate|v. 制定；系统阐述','foster|v. 培养、促进',
 'fragile|adj. 脆弱的、易碎的','framework|n. 框架、体系','fulfill|v. 实现、履行',
 'fundamental|adj. 基本的、根本的','generate|v. 产生、生成','genuine|adj. 真正的；真诚的',
 'gloomy|adj. 阴郁的、悲观的','governance|n. 治理、管理','gradual|adj. 逐渐的',
 'grant|v. 授予；同意 n. 拨款','grasp|v./n. 抓住；理解','grieve|v. 悲伤、悲痛',
 'hamper|v. 妨碍、阻碍','harsh|adj. 严厉的；恶劣的','hierarchy|n. 等级制度',
 'hinder|v. 阻碍、妨碍','hitherto|adv. 迄今、到目前为止','homogeneous|adj. 同质的',
 'hypothesis|n. 假设、假说','identical|adj. 完全相同的','ideology|n. 意识形态'
], 2);

/* ============ 3 档：低频（查漏补缺） ============ */
add([
 'ignorance|n. 无知、愚昧','illuminate|v. 照亮；阐明','imitate|v. 模仿、仿效',
 'immense|adj. 巨大的、广大的','immune|adj. 免疫的；免除的','implement|v. 实施、执行 n. 工具',
 'imply|v. 暗示、意味着','impose|v. 强加；征税','impress|v. 使印象深刻',
 'impulse|n. 冲动、脉冲','incidence|n. 发生率','incline|v. 倾向；倾斜',
 'incorporate|v. 合并、纳入','indicate|v. 表明、指出','indispensable|adj. 不可或缺的',
 'induce|v. 诱导、引起','indulge|v. 纵容、沉迷','inevitable|adj. 不可避免的',
 'infer|v. 推断、推论','inflate|v. 膨胀；通货膨胀','inherent|adj. 固有的、内在的',
 'inhibit|v. 抑制、阻碍','initiate|v. 发起、开始','innovation|n. 创新、革新',
 'insight|n. 洞察力、见解','inspire|v. 激励；启发','install|v. 安装；任命',
 'institute|n. 研究所、学院 v. 设立','instrument|n. 仪器；手段','insufficient|adj. 不足的',
 'integrate|v. 整合、融合','integrity|n. 正直；完整','intense|adj. 强烈的；激烈的',
 'interfere|v. 干涉、干扰','intervene|v. 干预、介入','intimate|adj. 亲密的；私下的',
 'intricate|adj. 错综复杂的','intrigue|v. 激起兴趣 n. 阴谋','intrinsic|adj. 内在的、固有的',
 'invaluable|adj. 极宝贵的','invasive|adj. 侵入的、侵略性的','invert|v. 倒置、反转',
 'irony|n. 讽刺、反讽','irrigate|v. 灌溉','isolate|v. 隔离、孤立',
 'jeopardize|v. 危及、损害','judicial|adj. 司法的、审判的','junction|n. 交叉点、枢纽',
 'justify|v. 证明…正当、为…辩护','kinship|n. 亲属关系','layman|n. 外行、门外汉',
 'legislate|v. 立法','legitimate|adj. 合法的、正当的','leverage|n. 杠杆作用 v. 利用',
 'literacy|n. 读写能力、识字','loom|v. 隐约出现；逼近','lucrative|adj. 赚钱的、有利可图的',
 'magnitude|n. 巨大；震级','mainstream|n. 主流','mandatory|adj. 强制的、义务的',
 'manipulate|v. 操纵、控制','margin|n. 页边空白；差额、利润','marginal|adj. 边缘的；微小的',
 'mature|adj. 成熟的 v. 成熟','maximize|v. 使最大化','mechanism|n. 机制、机理'
], 3);

/* ============ 高频词文章 ============ */
var P = window.CET6.VK.passages;
P.push({
  id:'KY1', title:'为什么"知道"不等于"理解"', kind:'reading', words:214, level:1,
  text:[
   ['Researchers have long assumed that access to information automatically produces understanding.','研究者长期假定，获取信息会自动带来理解。'],
   ['A recent experiment, however, suggests that the relationship is far more ambiguous than we tend to believe.','然而一项近期实验表明，这种关系比我们惯常以为的要模糊得多。'],
   ['Participants were asked to study a set of articles and then to predict how well they could explain the mechanisms described in them.','参与者被要求学习一组文章，然后预测自己能多好地解释文中描述的机制。'],
   ['Most people confidently asserted that they had acquired a genuine grasp of the subject.','大多数人自信地断言自己已经真正掌握了这个主题。'],
   ['When asked to articulate the actual process, nearly half could not proceed beyond vague generalities.','当被要求清晰说出实际过程时，近一半人无法超越含糊的泛泛之谈。'],
   ['This gap arises because familiarity is frequently mistaken for comprehension.','这一差距的出现，是因为熟悉感常被误当成理解。'],
   ['The researchers conclude that abundant exposure to a topic can create an illusion of knowledge.','研究者得出结论：大量接触某个话题会制造出知识的幻觉。'],
   ['Such an illusion is not merely harmless; it may hamper further learning, since people who believe they already understand rarely endeavor to verify their assumptions.','这种幻觉不仅无害；它还可能阻碍进一步学习，因为自认为已经理解的人很少去努力验证自己的假定。'],
   ['Educators therefore advocate frequent self-testing, which forces learners to confront what they cannot actually explain.','因此教育者提倡频繁的自我测试，这迫使学习者直面自己其实解释不了的东西。'],
   ['The findings have considerable implications for how institutions assess competence.','这些发现对机构如何评估能力具有相当大的启示。'],
   ['If we fail to distinguish genuine expertise from confident ignorance, we risk allocating resources on the basis of appearance rather than substance.','如果我们不能区分真正的专长与自信的无知，就可能基于表象而非实质来分配资源。']
  ],
  qs:[
   {n:1,type:'main',q:'这篇文章主要讨论的是：',o:['信息获取的渠道正在快速扩大','人们常把熟悉误当成理解，并因此需要自我检测','实验方法在心理学研究中存在缺陷','教育机构应当减少信息投放'],
    a:1,l2:'看第 4 段「This gap arises because…」那句，以及第 6 段教育者的建议。',
    loc:'This gap arises because familiarity is frequently mistaken for comprehension.',
    locZh:'这一差距的出现，是因为熟悉感常被误当成理解。',
    why:'全文围绕「familiarity 被误当成 comprehension」展开：先摆实验现象，再解释成因（第 4 段），最后给出对策（自我测试）。A、C、D 都是把局部细节当主旨。',hot:5},
   {n:2,type:'meaning',q:'第 3 段中的 "articulate" 最接近的意思是：',o:['清楚地表达','争论、反驳','重复、背诵','质疑、怀疑'],
    a:0,l2:'定位第 3 段「articulate the actual process」。',
    loc:'When asked to articulate the actual process, nearly half could not proceed beyond vague generalities.',
    locZh:'当被要求清晰说出实际过程时，近一半人无法超越含糊的泛泛之谈。',
    why:'articulate 作动词是「清晰表达」。线索在后半句：做不到 articulate 的人只能说出 vague generalities（含糊的泛泛之谈），说明 articulate 是它的反义——说得清楚。',hot:5},
   {n:3,type:'detail',q:'根据实验，大约多少参与者无法真正解释所学内容？',o:['不到四分之一','接近一半','超过八成','全部'],
    a:1,l2:'定位第 3 段末尾的数字表述。',
    loc:'nearly half could not proceed beyond vague generalities',
    locZh:'近一半人无法超越含糊的泛泛之谈。',
    why:'原文 nearly half = 接近一半。注意 A「不到四分之一」和 C「超过八成」都是典型的数量陷阱，回原文核对数字即可排除。',hot:5},
   {n:4,type:'infer',q:'从文章可以推断，自我测试之所以有用是因为它：',o:['能让人学得更快','迫使学习者暴露自己解释不了的部分','减少了学习所需的时间','提高了记忆的持久性'],
    a:1,l2:'定位第 6 段「forces learners to confront what they cannot actually explain」。',
    loc:'which forces learners to confront what they cannot actually explain',
    locZh:'这迫使学习者直面自己其实解释不了的东西。',
    why:'推断题的正确项是原文的同义改写：confront what they cannot explain = 暴露自己解释不了的部分。B 之外三项原文都没提，属于凭常识编造。',hot:5},
   {n:5,type:'attitude',q:'作者对「信息获取带来理解」这一假设的态度是：',o:['完全赞同','有所保留、指出其局限','强烈反对并否定其价值','不置可否'],
    a:1,l2:'注意第 2 段 however 后的转折，以及第 5 段对后果的限定（not merely harmless）。',
    loc:'A recent experiment, however, suggests that the relationship is far more ambiguous than we tend to believe.',
    locZh:'然而一项近期实验表明，这种关系比我们惯常以为的要模糊得多。',
    why:'作者没有全盘否定（不是 C），而是指出该假设「far more ambiguous」——即过于简化、有局限。态度题排除极端项后，B 的「有所保留」最贴合。',hot:4}
  ]
});

P.push({
  id:'KY2', title:'技术在缓解资源压力上有多大用', kind:'reading', words:208, level:2,
  text:[
   ['It is widely assumed that technological innovation will inevitably alleviate the pressure that a growing population exerts on natural resources.','人们普遍假定，技术创新必将缓解人口增长对自然资源施加的压力。'],
   ['This assumption deserves scrutiny, because efficiency gains frequently fail to reduce total consumption.','这一假定值得推敲，因为效率提升常常并未降低总消耗量。'],
   ['When a manufacturing process becomes more efficient, the cost of each unit declines, and demand tends to expand accordingly.','当制造过程变得更高效，单位成本下降，需求往往随之扩张。'],
   ['Economists refer to this as a rebound effect: the savings achieved are partially or entirely offset by increased use.','经济学家称之为回弹效应：所节省的部分被使用量的增加部分或全部抵消。'],
   ['Historical evidence supports the concern. Improvements in engine efficiency, for instance, did not curtail fuel consumption in the aggregate.','历史证据支持这一担忧。例如，发动机效率的提升并未在总体上削减燃料消耗。'],
   ['None of this implies that innovation is futile. It does imply that innovation alone cannot be expected to resolve the problem.','这些都不意味着创新是徒劳的。它只意味着，不能指望单靠创新解决问题。'],
   ['Policies that constrain consumption directly—through quotas or pricing—address the mechanism that efficiency improvements leave untouched.','通过配额或定价直接约束消费的政策，触及的正是效率改进所没有触及的机制。'],
   ['A comprehensive approach would therefore combine technical progress with deliberate limits on aggregate demand.','因此，一套综合的做法会把技术进步与对总需求的有意限制结合起来。'],
   ['Whether governments possess the resolve to impose such limits remains an open question.','各国政府是否具备施加这类限制的决心，仍是一个悬而未决的问题。']
  ],
  qs:[
   {n:1,type:'main',q:'文章的中心论点是：',o:['技术创新对资源问题毫无帮助','单靠技术创新不足以解决资源压力，需配合需求限制','回弹效应是经济学中最严重的缺陷','政府应当停止资助技术研发'],
    a:1,l2:'看第 6 段的「It does imply…」以及第 8 段的 therefore 结论句。',
    loc:'It does imply that innovation alone cannot be expected to resolve the problem.',
    locZh:'它只意味着，不能指望单靠创新解决问题。',
    why:'全文结构：提出流行假定 → 用回弹效应质疑 → 明确并非否定创新（排除 A）→ 给出「技术 + 需求限制」的组合方案。B 完整覆盖了这个推进。',hot:5},
   {n:2,type:'meaning',q:'第 4 段中的 "offset" 最接近：',o:['加速、促进','抵消、弥补','记录、统计','估计、预测'],
    a:1,l2:'定位第 4 段冒号后的解释句。',
    loc:'the savings achieved are partially or entirely offset by increased use',
    locZh:'所节省的部分被使用量的增加部分或全部抵消。',
    why:'句子结构是「节省的部分 被 用量增加 offset」——既然是被动承受且结果是节省失效，offset 只能是「抵消」。A 方向相反，C、D 与语境无关。',hot:5},
   {n:3,type:'detail',q:'回弹效应指的是：',o:['效率提升导致成本上升','节省下来的部分被增加的使用量抵消','人口增长直接导致资源枯竭','政府配额造成市场萎缩'],
    a:1,l2:'定位第 4 段 "rebound effect" 后的冒号解释。',
    loc:'Economists refer to this as a rebound effect: the savings achieved are partially or entirely offset by increased use.',
    locZh:'经济学家称之为回弹效应：所节省的部分被使用量的增加部分或全部抵消。',
    why:'原文用冒号直接给出定义，属于送分的细节题。A 说成本上升，与原文 cost declines 相反。',hot:5},
   {n:4,type:'infer',q:'作者举发动机效率的例子是为了说明：',o:['发动机技术仍有很大的改进空间','历史上的效率提升确实带来了总体消耗下降','效率提升未必带来总体消耗下降，这一点有历史依据','燃料消耗与人口增长无关'],
    a:2,l2:'定位第 5 段，注意例子前的观点句与例子本身的否定表述。',
    loc:'Improvements in engine efficiency, for instance, did not curtail fuel consumption in the aggregate.',
    locZh:'例如，发动机效率的提升并未在总体上削减燃料消耗。',
    why:'例子的作用是为上一段的回弹效应提供历史证据。C 是原文 did not curtail ... in the aggregate 的同义改写；B 与之相反。',hot:5},
   {n:5,type:'attitude',q:'作者对「直接约束消费的政策」持什么态度？',o:['认为完全不可行','认为有必要，但对其落实存疑','认为会严重损害创新','认为与资源问题无关'],
    a:1,l2:'看第 7 段的正面评价与第 9 段结尾的 open question。',
    loc:'Whether governments possess the resolve to impose such limits remains an open question.',
    locZh:'各国政府是否具备施加这类限制的决心，仍是一个悬而未决的问题。',
    why:'第 7 段肯定了这类政策触及了效率改进没触及的机制（有必要），第 9 段却说政府是否有决心仍是 open question（存疑）。合起来正是 B。',hot:4}
  ]
});

P.push({
  id:'KY3', title:'匿名评审的两难', kind:'reading', words:212, level:3,
  text:[
   ['Peer review is conventionally presented as the mechanism that guarantees the reliability of published research.','同行评审通常被描述为保证已发表研究可靠性的机制。'],
   ['Its defenders contend that scrutiny by independent experts filters out error and deters careless work.','它的辩护者主张，独立专家的审查能滤除错误并遏止粗心的工作。'],
   ['Critics, however, point to a persistent anomaly: the process is far less consistent than its reputation implies.','然而批评者指出一个长期存在的反常现象：这一过程远不如其名声所暗示的那样稳定。'],
   ['The same manuscript submitted to different reviewers may receive evaluations that diverge sharply.','同一份稿件投给不同评审人，可能得到差异极大的评价。'],
   ['Anonymity, which was introduced to protect reviewers from retaliation, also diminishes accountability.','当初为保护评审人免遭报复而引入的匿名制，同时也削弱了问责。'],
   ['A reviewer who need not sign a report faces weaker incentives to scrutinize the work thoroughly.','不必在评审意见上署名的评审人，缺乏彻底审查该工作的足够动力。'],
   ['Several journals have consequently experimented with open review, in which reports are published alongside the article.','因此一些期刊尝试了公开评审，即评审意见与文章一同发表。'],
   ['Early results are suggestive rather than conclusive: reports do become more courteous, though not necessarily more rigorous.','早期结果具有启发性而非决定性：评审意见确实变得更客气，却未必更严格。'],
   ['The deeper difficulty is that no system can fully eliminate subjective judgment from evaluation.','更深层的困难在于，没有任何制度能完全消除评价中的主观判断。'],
   ['What reform can accomplish is to make that judgment visible, and therefore open to challenge.','改革所能做到的，是让这种判断变得可见，从而可被质疑。']
  ],
  qs:[
   {n:1,type:'main',q:'文章主要探讨的是：',o:['如何成为合格的期刊评审人','同行评审的作用与其内在局限，以及公开评审的尝试','学术出版的历史演变','匿名制应当被彻底废除'],
    a:1,l2:'梳理全文：前两段讲作用，第 3 段 however 转向局限，第 7 段起讲改进尝试与结论。',
    loc:'the process is far less consistent than its reputation implies',
    locZh:'这一过程远不如其名声所暗示的那样稳定。',
    why:'D 是极端项——原文只说公开评审在试验中，并未主张彻底废除匿名制。B 完整覆盖「作用 → 局限 → 改革尝试」这条主线。',hot:5},
   {n:2,type:'meaning',q:'第 3 段中的 "anomaly" 最接近：',o:['惯例、常规','反常、不合规律的现象','优势、长处','争议、分歧'],
    a:1,l2:'看冒号后的解释：过程远不如名声所暗示的稳定。',
    loc:'the process is far less consistent than its reputation implies',
    locZh:'这一过程远不如其名声所暗示的那样稳定。',
    why:'anomaly 指「与预期不符的反常现象」。线索是前两段建立了「评审很可靠」的预期，本段用 however + anomaly 打破它。',hot:5},
   {n:3,type:'detail',q:'根据文章，匿名制最初被引入的目的是：',o:['提高评审的严格程度','保护评审人免遭报复','加快审稿速度','让作者更容易接受意见'],
    a:1,l2:'定位第 5 段 "which was introduced to protect..."。',
    loc:'Anonymity, which was introduced to protect reviewers from retaliation, also diminishes accountability.',
    locZh:'当初为保护评审人免遭报复而引入的匿名制，同时也削弱了问责。',
    why:'原文直接给出目的。注意本句后半的 also diminishes accountability 是副作用，不是目的，别混。',hot:5},
   {n:4,type:'infer',q:'关于公开评审的早期结果，可以推断出：',o:['它使评审明显更加严格','它彻底解决了主观判断的问题','它改善了态度但严格程度未必提升','它导致评审人大量退出'],
    a:2,l2:'定位第 8 段，注意 though 后的让步。',
    loc:'reports do become more courteous, though not necessarily more rigorous',
    locZh:'评审意见确实变得更客气，却未必更严格。',
    why:'more courteous = 态度改善；not necessarily more rigorous = 严格程度未必提升。B 的「彻底解决」被第 9 段明确否定。',hot:5},
   {n:5,type:'attitude',q:'作者对同行评审改革的整体判断是：',o:['改革可以消除主观判断','改革的价值在于让判断可见、可被质疑','改革毫无意义，应保持现状','改革会破坏学术自由'],
    a:1,l2:'看最后两段：第 9 段说无法完全消除主观判断，第 10 段用 What reform can accomplish 给出定位。',
    loc:'What reform can accomplish is to make that judgment visible, and therefore open to challenge.',
    locZh:'改革所能做到的，是让这种判断变得可见，从而可被质疑。',
    why:'A 被第 9 段 no system can fully eliminate 直接否定；C、D 都无原文依据。B 是末句的同义改写。',hot:4}
  ]
});

P.push({
  id:'KY4', title:'大学为什么难以放弃排名', kind:'reading', words:208, level:2,
  text:[
   ['Universities rarely abandon a ranking system they have once adopted, even when its defects become apparent.',
    '大学很少会放弃一套已经采用的排名体系，即使它的缺陷已经变得明显。'],
   ['What accompanies the defence of such systems is usually an appeal to accountability: administrators must be able to assess performance.',
    '为这类体系辩护时，通常伴随着对问责的诉求：管理者必须能够评估绩效。'],
   ['The assumption is questionable, because the indicators available to them capture only a narrow aspect of scholarly work.',
    '这个假定是有问题的，因为他们能拿到的指标只捕捉到学术工作的狭窄一面。'],
   ['Citations accumulate slowly and unevenly, and a young scholar who anticipates this may adjust his choice of topic accordingly.',
    '引用的累积缓慢且不均，预见到这一点的年轻学者可能会据此调整自己的选题。'],
   ['A more adequate measure would acknowledge that teaching, mentoring and public writing also constitute academic contribution.',
    '一个更充分的衡量方式会承认：教学、指导和面向公众的写作同样构成学术贡献。'],
   ['Reformers who propose such changes are frequently told that the administration lacks the authority to alter evaluation rules.',
    '提出这类改革的改革者，常常被告知管理层没有权力去改变评价规则。'],
   ['When reforms are approved, they are often accompanied by new reporting duties assigned to the same overburdened staff.',
    '即便改革获得批准，它们也往往伴随着新的汇报义务，而这些义务被派给了本已超负荷的同一批人员。'],
   ['Assisted by external reviewers, a few departments have managed to adapt the criteria to their own fields, but the results remain uneven.',
    '在外部评审者的协助下，少数院系成功地把标准调整到适合自身学科，但结果仍然参差不齐。'],
   ['What is arbitrary is not the wish to measure quality, but the belief that a single number can represent it.',
    '任意的并不是衡量质量的愿望，而是「一个数字就能代表质量」这一信念。'],
   ['Until that belief is examined, scholars will remain aware that their work is judged by instruments they did not design.',
    '在这一信念被检验之前，学者们会一直清楚：自己的成果是由他们并未参与设计的工具来评判的。']
  ],
  qs:[
   {n:1,type:'main',q:'文章主要讨论的是：',o:['引用指标的统计方法','大学依赖排名体系的原因及其问题','年轻学者应如何选择课题','外部评审制度的运作流程'],
    a:1,l2:'看第 2 段的辩护理由、第 3 段的 questionable 和第 9 段的结论。',
    loc:'The assumption is questionable, because the indicators available to them capture only a narrow aspect of scholarly work.',
    locZh:'这个假定是有问题的，因为他们能拿到的指标只捕捉到学术工作的狭窄一面。',
    why:'全文围绕「为什么不放弃 + 为什么不合理」展开，B 两面俱全。A、C、D 都是文中举例或局部细节。',hot:5},
   {n:2,type:'meaning',q:'第 9 段中的 "arbitrary" 最接近：',o:['随意的、缺乏依据的','合理的、有据的','临时的','罕见的'],
    a:0,l2:'看第 9 段 not...but... 的结构，重点在 but 后面。',
    loc:'the belief that a single number can represent it',
    locZh:'「一个数字就能代表质量」这一信念。',
    why:'作者说「不是愿望任意，而是这个信念任意」，即单一数字代表质量缺乏依据。B 与态度相反。',hot:5},
   {n:3,type:'detail',q:'年轻学者可能会因为引用累积的特点而：',o:['放弃学术研究','据此调整自己的选题','转而从事行政工作','刻意增加论文数量'],
    a:1,l2:'定位第 4 段 who anticipates this 中的 this 指代什么。',
    loc:'a young scholar who anticipates this may adjust his choice of topic accordingly',
    locZh:'预见到这一点的年轻学者可能会据此调整自己的选题。',
    why:'this 指代前句「引用累积缓慢且不均」，结果就是 adjust his choice of topic。B 为同义改写。',hot:5},
   {n:4,type:'infer',q:'改革即便获批也往往效果有限，是因为：',o:['学者普遍反对改革','新义务加给了本已超负荷的同一批人','外部评审者不够专业','评价标准过于宽松'],
    a:1,l2:'定位第 7 段 often accompanied by 这一让步后的补充。',
    loc:'they are often accompanied by new reporting duties assigned to the same overburdened staff',
    locZh:'它们也往往伴随着新的汇报义务，而这些义务被派给了本已超负荷的同一批人员。',
    why:'overburdened staff 承担更多 reporting duties，改革自然难见效，B 对应。A、C、D 均无依据。',hot:4},
   {n:5,type:'attitude',q:'作者对现行评价体系的立场是：',o:['完全支持，认为其科学严谨','承认其必要性但指出其局限','主张彻底废除排名','认为问题无解'],
    a:1,l2:'第 2 段承认问责的必要性，第 9 段说「愿望本身并不任意」。',
    loc:'What is arbitrary is not the wish to measure quality, but the belief that a single number can represent it.',
    locZh:'任意的并不是衡量质量的愿望，而是「一个数字就能代表质量」这一信念。',
    why:'作者明确说「衡量的愿望」并不任意（排除 C），只否定单一数字的做法，故 B。D 与第 5、8 段提出的改进方案矛盾。',hot:4}
  ]
});

P.push({
  id:'KY5', title:'密度、公共服务与城市承诺', kind:'reading', words:214, level:2,
  text:[
   ['Contemporary cities concentrate people, capital and complaints in roughly the same places.',
    '当代城市把人口、资本和抱怨集中在了大致相同的几个地方。'],
   ['Density is often cited as the engine of innovation, though the claim is more controversial than its supporters admit.',
    '密度常被引用为创新的引擎，尽管这一论断比其支持者所承认的更具争议。'],
   ['A constant influx of residents compels municipalities to expand capacity: schools, clinics and transport must keep pace.',
    '居民的持续涌入迫使市政当局扩大容量：学校、诊所和交通必须跟上。'],
   ['When investment fails to coincide with arrivals, the consequence is a visible burden on services that were already strained.',
    '当投资未能与人口流入同步，后果就是本已紧张的服务背上可见的负担。'],
   ['Contrary to the assumption that growth automatically compensates for such pressure, several districts have seen standards decline.',
    '与「增长会自动补偿这种压力」的假定相反，若干区域的服务标准出现了下降。'],
   ['Planners who consult residents before approving a project tend to conduct it more competently, because local knowledge clarifies the context.',
    '在批准项目前咨询过居民的规划者，往往能把项目推进得更称职，因为本地知识厘清了背景。'],
   ['Where consultation is confined to a single public meeting, the outcome frequently conflicts with what the neighbourhood actually wants.',
    '在咨询被限定为一场公开会议的场合，结果常常与社区真正的诉求相冲突。'],
   ['Housing, whatever its defenders argue, cannot be treated as an ordinary commodity: it is not a category of goods like any other.',
    '住房，无论其辩护者如何主张，都不能被当作普通商品：它不是与其他商品同类的一类货品。'],
   ['A coherent policy would consist of density targets, transport spending and a ceiling on rents, rather than a campaign to boost construction alone.',
    '一个连贯的政策应当包含密度目标、交通投入和租金上限，而不是一场只推动建设的运动。'],
   ['Cities that are capable of coordinating these instruments confirm the point; those that merely condemn the shortage do not.',
    '有能力协调这些手段的城市印证了这一点；那些只会谴责短缺的城市则不然。']
  ],
  qs:[
   {n:1,type:'main',q:'文章的中心论点是：',o:['城市应停止人口聚集','密度本身不够，需配套公共服务与政策组合','住房应完全市场化','公开会议是无效的决策形式'],
    a:1,l2:'看第 3、4 段的容量矛盾，以及第 9 段的 A coherent policy would consist of。',
    loc:'A coherent policy would consist of density targets, transport spending and a ceiling on rents',
    locZh:'一个连贯的政策应当包含密度目标、交通投入和租金上限。',
    why:'全文：密度的好处被质疑→容量跟不上→政策须组合。B 概括了「密度+配套」的核心。A、C 与原文相反，D 是局部细节。',hot:5},
   {n:2,type:'meaning',q:'第 9 段中的 "coherent" 最接近：',o:['连贯的、成体系的','宽松的','昂贵的','短期的'],
    a:0,l2:'看 consist of 后面列举的三项，以及 rather than 的对照。',
    loc:'rather than a campaign to boost construction alone',
    locZh:'而不是一场只推动建设的运动。',
    why:'与「单一运动」相对的是「三项配套的组合」，故 coherent = 成体系的。B、C、D 均无对应。',hot:5},
   {n:3,type:'detail',q:'作者认为咨询居民的作用在于：',o:['降低项目成本','以本地知识厘清背景，推进更称职','加快审批速度','避免所有冲突'],
    a:1,l2:'定位第 6 段 because 后的原因从句。',
    loc:'because local knowledge clarifies the context',
    locZh:'因为本地知识厘清了背景。',
    why:'clarifies the context + conduct it more competently → B。D 中「所有」过于绝对，为典型绝对化干扰项。',hot:5},
   {n:4,type:'infer',q:'作者暗示住房问题的特殊性在于：',o:['它比其他商品更贵','它不能被当作普通商品来处理','它无法由市场提供','它只在大城市存在'],
    a:1,l2:'定位第 8 段 cannot be treated as 这一表述。',
    loc:'cannot be treated as an ordinary commodity',
    locZh:'不能被当作普通商品。',
    why:'cannot be treated as an ordinary commodity = 不能当普通商品处理，B 直接对应。C 与原文（不否定市场作用）冲突。',hot:4},
   {n:5,type:'attitude',q:'作者对「以密度促创新」这一说法的态度是：',o:['完全认同','承认其有力但指出配套不足的现实','坚决反对','未作评价'],
    a:1,l2:'看第 2 段的 more controversial，以及第 3—5 段的现实约束。',
    loc:'though the claim is more controversial than its supporters admit',
    locZh:'尽管这一论断比其支持者所承认的更具争议。',
    why:'作者未否认密度的作用（排除 C），但指出争议与现实约束，故 B。D 与全文大量评述矛盾。',hot:4}
  ]
});
})();
