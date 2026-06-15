import { GeneratedTrip, TripInput } from './types';
import { tripDays } from './validation';

const placeBank: Record<string, string[]> = {
  成都: ['宽窄巷子', '人民公园', '武侯祠', '锦里', '熊猫基地', '东郊记忆', '太古里'],
  杭州: ['西湖', '灵隐寺', '法喜寺', '龙井村', '河坊街', '良渚博物院', '京杭大运河'],
  北京: ['故宫', '景山公园', '什刹海', '国家博物馆', '颐和园', '798 艺术区', '天坛'],
  广州: ['沙面', '陈家祠', '永庆坊', '北京路', '珠江夜游', '广东省博物馆', '东山口'],
  云南: ['翠湖公园', '云南大学', '大理古城', '洱海', '喜洲古镇', '丽江古城', '束河古镇']
};

const categories = ['城市漫游', '历史文化', '本地美食', '拍照打卡', '自然风景', '夜间活动'];

export function generateMockTrip(input: TripInput): GeneratedTrip {
  const days = tripDays(input.startDate, input.endDate);
  const places = placeBank[input.destination] || [
    `${input.destination}老街`,
    `${input.destination}博物馆`,
    `${input.destination}城市公园`,
    `${input.destination}本地市场`,
    `${input.destination}观景点`,
    `${input.destination}夜生活街区`
  ];
  const dailyBudget = Math.floor(input.budget / days);

  return {
    title: `${input.origin}出发 ${input.destination}${days}日${paceLabel(input.pace)}旅行计划`,
    summary: `围绕${input.preferences.join('、')}设计的单目的地行程，控制在约 ${input.budget} 元预算内，适合先验证规划链路。`,
    totalBudget: input.budget,
    days: Array.from({ length: days }, (_, index) => {
      const base = index * 2;
      const itemPlaces = [
        places[base % places.length],
        places[(base + 1) % places.length],
        places[(base + 2) % places.length]
      ];
      return {
        dayIndex: index + 1,
        title: `第 ${index + 1} 天：${itemPlaces[0]}到${itemPlaces[2]}`,
        summary: index === 0 ? '抵达后先用轻量路线适应城市节奏。' : '按区域集中游玩，减少跨城移动和等待时间。',
        dayBudget: dailyBudget,
        items: itemPlaces.map((place, itemIndex) => ({
          startTime: ['09:30', '13:30', '18:30'][itemIndex],
          endTime: ['11:30', '16:30', '20:30'][itemIndex],
          placeName: place,
          category: categories[(index + itemIndex) % categories.length],
          notes: `${place}适合结合${input.preferences[itemIndex % input.preferences.length]}体验，注意预留交通和排队时间。`,
          estimatedCost: Math.max(60, Math.floor(dailyBudget / 4) + itemIndex * 30)
        }))
      };
    }),
    tips: [
      '同一区域景点尽量排在同一天，减少路上消耗。',
      '预算中建议预留 10% 作为临时交通、咖啡和门票浮动。',
      '热门景点提前查看预约规则，避免到场后无法进入。'
    ]
  };
}

function paceLabel(pace: TripInput['pace']) {
  if (pace === 'relaxed') return '轻松';
  if (pace === 'intensive') return '高密度';
  return '标准';
}
