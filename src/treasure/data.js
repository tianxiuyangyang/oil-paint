// What is hidden in each of the two pictures: eight things a walk, each with a place to stand near, a line about it
// for the catalogue once it is found, and a line to hint at where it is while it is not.
//
// The places are given along the way each walk takes: in the aurora the crest (crestX(z) = 30 sin(z/140) +
// 12 sin(z/47 + 1), from z = 300 at the start to the cabin at z = -64); in the wood, the worn way from z = 78 to the
// clearing at z = -96. Both walks are clear of trunks within a couple of metres of those lines, which is where the
// things sit — and the treasure code nudges one aside if a pine is closer than it should be.
export const TREASURES = {
  aurora: [
    {
      id: 'aurora.key', thing: 'key', at: [36.8, 284], yaw: -0.4, tint: '#f0c76a',
      zh: '铜钥匙', en: 'Brass key',
      text: '齿口磨得发亮——有人在这条山脊上来回走了很多次，才把门锁磨成这样。',
      hint: '起点身后的雪坡上，云杉之间。',
    },
    {
      id: 'aurora.vial', thing: 'vial', at: [23.8, 232], yaw: 0.7, tint: '#8fd8e8',
      zh: '玻璃小瓶', en: 'Glass vial',
      text: '里面还剩一点会发光的液体。是药，还是没调完的颜料，说不好。',
      hint: '雪坡东侧，一棵倒下的云杉旁边。',
    },
    {
      id: 'aurora.watch', thing: 'watch', at: [20.2, 190], yaw: 1.1, tint: '#e8d9b0',
      zh: '停摆的怀表', en: 'Stopped watch',
      text: '指针停在十一点四十七分。大概是某个人走进这幅画的时间。',
      hint: '山丘顶上，雪最平的那一片。',
    },
    {
      id: 'aurora.bird', thing: 'bird', at: [14.1, 150], yaw: -1.9, tint: '#b07a42',
      zh: '木刻小鸟', en: 'Carved bird',
      text: '刀口很新，木屑还留在翅膀的缝里。刻它的人没有刻完。',
      hint: '山丘西侧的缓坡上，正对着极光最亮的那一段。',
    },
    {
      id: 'aurora.bell', thing: 'bell', at: [22.2, 100], yaw: 0.2, tint: '#ffcf7a',
      zh: '黄铜铃', en: 'Brass bell',
      text: '摇起来没有声音。这世界里本来就没有声音，只有笔触。',
      hint: '山脊中段，一棵孤零零的松树脚下。',
    },
    {
      id: 'aurora.shard', thing: 'shard', at: [17.8, 40], yaw: 2.4, tint: '#cfd6d2',
      zh: '星图残片', en: 'Star chart shard',
      text: '一小片天空画在锡板上，和头顶的那片对不上——多了三颗星。',
      hint: '北坡的一个雪窝里。',
    },
    {
      id: 'aurora.letter', thing: 'letter', at: [8.2, -10], yaw: 0.9, tint: '#e8d5a8',
      zh: '蜡封的信', en: 'Sealed letter',
      text: '收信人的名字被雪打湿，糊成一团颜色。信封是鼓的。',
      hint: '离小屋还有一段路，一块半埋在雪里的石头上。',
    },
    {
      id: 'aurora.oilcan', thing: 'oilcan', at: [-10.8, -56], yaw: -0.6, tint: '#9aa3ad',
      zh: '灯油壶', en: 'Oil can',
      text: '空了。可他手里那盏灯还亮着，一路都没暗过。',
      hint: '小屋门口的地上，就在门槛外边。',
    },
  ],

  autumn: [
    {
      id: 'autumn.knife', thing: 'knife', at: [1.0, 72], yaw: 0.5, tint: '#d9dcd6',
      zh: '调色刀', en: 'Palette knife',
      text: '刀刃上凝着一层干掉的赭石，边上还有一点金。',
      hint: '起点边上的落叶堆里。',
    },
    {
      id: 'autumn.cup', thing: 'cup', at: [-6.0, 54], yaw: -0.8, tint: '#d8a880',
      zh: '陶杯', en: 'Clay cup',
      text: '杯底画着一只很拙的鸟。雪岭上那只木刻的，和它像是一对。',
      hint: '第一个弯道的内侧，路边的石头旁。',
    },
    {
      id: 'autumn.acorn', thing: 'acorn', at: [4.0, 30], yaw: 1.4, tint: '#c98f3f',
      zh: '橡子', en: 'Acorn',
      text: '完好的，帽子也还在。林子里的松鼠这一年大概过得不坏。',
      hint: '路的右边，一棵橡树的根下。',
    },
    {
      id: 'autumn.marble', thing: 'marble', at: [9.5, 6], yaw: 0.0, tint: '#b6e6f2',
      zh: '玻璃弹珠', en: 'Glass marble',
      text: '对着光看，里面有一小片绿色的光在慢慢转，像一场缩小的极光。',
      hint: '路东边的浅坑里。',
    },
    {
      id: 'autumn.tube', thing: 'tube', at: [2.0, -20], yaw: -1.2, tint: '#e0a94a',
      zh: '颜料管', en: 'Paint tube',
      text: '挤出来的不是颜料，是阳光的颜色。管口已经干住。',
      hint: '路弯最急的地方，踩出来的车辙边上。',
    },
    {
      id: 'autumn.bell', thing: 'bell', at: [-4.5, -44], yaw: 0.9, tint: '#ffcf7a',
      zh: '黄铜铃', en: 'Brass bell',
      text: '和雪岭上那只一模一样。也许本来就是一对，一个人带走了两只。',
      hint: '路西边，两棵白桦之间。',
    },
    {
      id: 'autumn.bird', thing: 'bird', at: [4.0, -68], yaw: 2.0, tint: '#b07a42',
      zh: '木刻小鸟', en: 'Carved bird',
      text: '羽毛是用笔尖刻出来的，一刀一刀，没有一刀是直的。',
      hint: '快到空地了，路的右侧。',
    },
    {
      id: 'autumn.watch', thing: 'watch', at: [11.0, -92], yaw: 1.7, tint: '#e8d9b0',
      zh: '怀表', en: 'Pocket watch',
      text: '还在走。雪岭上那只停了，这只没有——时间在这幅画里是活的。',
      hint: '空地正中央，落叶最厚的地方。',
    },
  ],
};
