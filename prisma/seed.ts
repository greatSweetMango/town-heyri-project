import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Admin account
  const adminEmail = process.env.ADMIN_EMAIL || "admin@townheyri.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin1234!";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: "관리자",
      role: "ADMIN",
    },
  });

  // 2. Feature flags
  const flags = [
    { name: "trails_enabled", enabled: false, description: "산책로 표시" },
    { name: "gates_enabled", enabled: false, description: "출입구(Gate) 표시" },
    { name: "kakao_map", enabled: false, description: "카카오맵 버전 사용" },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { name: flag.name },
      update: {},
      create: flag,
    });
  }

  // 3. Stores (existing 18 + new samples)
  const stores = [
    // 카페
    { name: "포레스트 커피", category: "cafe", description: "숲 속에 자리한 핸드드립 전문 카페. 자연 채광이 아름다운 통유리 공간.", story: "2005년 도예가 출신의 부부가 직접 설계한 공간입니다. 건물 외벽의 타일은 모두 수작업으로 구워낸 도자 타일이며, 커피잔 역시 직접 빚은 작품입니다.", positionX: 30, positionY: 25, tags: ["핸드드립", "디저트", "테라스"], openHours: "10:00 - 20:00" },
    { name: "갤러리 카페 모먼트", category: "cafe", description: "전시와 커피를 동시에 즐기는 복합문화 카페. 매월 새로운 작가 전시.", story: "매달 신진 작가의 작품을 전시하며, 작품 판매 수익의 일부는 지역 예술 교육에 기부됩니다.", positionX: 45, positionY: 35, tags: ["전시", "라떼아트", "인스타감성"], openHours: "11:00 - 21:00" },
    { name: "헤이리 로스터리", category: "cafe", description: "직접 로스팅한 싱글오리진 원두와 시그니처 블렌드를 맛볼 수 있는 곳.", positionX: 62, positionY: 20, tags: ["로스팅", "원두판매", "테이크아웃"], openHours: "09:00 - 19:00" },
    { name: "카페 느린오후", category: "cafe", description: "정원이 아름다운 카페. 수제 케이크와 허브티가 인기.", positionX: 75, positionY: 45, tags: ["정원", "케이크", "허브티"], openHours: "10:00 - 19:00" },
    { name: "책과 커피 사이", category: "cafe", description: "독립 서점과 카페가 결합된 공간. 큐레이션된 책과 커피를 즐길 수 있다.", positionX: 22, positionY: 62, tags: ["독립서점", "드립커피", "조용한"], openHours: "10:00 - 20:00" },
    // 음식점
    { name: "돌담집", category: "restaurant", description: "헤이리 터줏대감. 정갈한 한식 코스와 계절 메뉴가 인기.", story: "2002년 헤이리 초창기부터 자리를 지킨 한식당입니다. 돌담 정원에서 사계절을 느끼며 식사할 수 있습니다.", positionX: 38, positionY: 55, tags: ["한식", "코스요리", "정원"], openHours: "11:30 - 21:00" },
    { name: "파스타 아틀리에", category: "restaurant", description: "수제 생면 파스타와 자연 발효 빵을 만드는 이탈리안 레스토랑.", positionX: 55, positionY: 45, tags: ["이탈리안", "생면파스타", "와인"], openHours: "11:00 - 21:00" },
    { name: "숲속화덕피자", category: "restaurant", description: "장작 화덕에서 구워내는 정통 나폴리 피자. 야외 테라스 인기.", positionX: 68, positionY: 55, tags: ["피자", "화덕", "야외"], openHours: "11:30 - 20:30" },
    { name: "헤이리 국밥", category: "restaurant", description: "뜨끈한 사골 국밥과 수육 백반. 든든한 한 끼가 필요할 때.", positionX: 32, positionY: 42, tags: ["한식", "국밥", "백반"], openHours: "10:00 - 20:00" },
    // 갤러리·전시
    { name: "한길책박물관", category: "gallery", description: "아시아 최대 규모의 책 박물관. 10만 권 이상의 소장 도서와 기획 전시.", story: "출판사 한길사가 30년간 수집한 세계 각국의 책과 인쇄물을 전시합니다. 건물 자체가 건축가 승효상의 대표작입니다.", positionX: 25, positionY: 40, tags: ["박물관", "건축", "독서"], openHours: "10:00 - 18:00" },
    { name: "현대어린이책미술관", category: "gallery", description: "그림책 원화 전시와 어린이 체험 프로그램을 운영하는 미술관.", positionX: 50, positionY: 60, tags: ["어린이", "그림책", "체험"], openHours: "10:00 - 17:30" },
    { name: "블루메미술관", category: "gallery", description: "현대미술 기획 전시와 교육 프로그램이 활발한 미술관.", story: "꽃(Blume)이라는 이름처럼, 예술이 일상에서 피어나길 바라는 철학으로 운영됩니다.", positionX: 70, positionY: 30, tags: ["현대미술", "교육", "기획전시"], openHours: "10:00 - 18:00" },
    { name: "포토갤러리 빛", category: "gallery", description: "사진 작가들의 기획전과 상설전을 만날 수 있는 사진 전문 갤러리.", positionX: 58, positionY: 25, tags: ["사진", "전시", "포토"], openHours: "10:00 - 18:00" },
    // 공방·체험
    { name: "도자공방 흙", category: "workshop", description: "물레 체험부터 핸드빌딩까지, 누구나 도예를 즐길 수 있는 공방.", story: "이곳의 도예가는 일본에서 10년간 수련 후 헤이리에 정착했습니다. 가마 소성 과정을 직접 볼 수 있는 국내 몇 안 되는 공방입니다.", positionX: 35, positionY: 70, tags: ["도자기", "체험", "원데이클래스"], openHours: "10:00 - 17:00" },
    { name: "가죽공방 손끝", category: "workshop", description: "이탈리아 베지터블 가죽으로 만드는 나만의 소품. 당일 완성 가능.", positionX: 20, positionY: 55, tags: ["가죽", "원데이클래스", "선물"], openHours: "10:00 - 18:00" },
    { name: "캔들공방 향기", category: "workshop", description: "천연 소이왁스로 나만의 향초를 만드는 체험. 아로마 블렌딩 수업도.", positionX: 52, positionY: 72, tags: ["캔들", "아로마", "원데이클래스"], openHours: "10:00 - 18:00" },
    { name: "목공방 나무결", category: "workshop", description: "원목으로 소품을 만드는 목공 체험. 도마, 트레이, 우드 스푼 등.", positionX: 28, positionY: 78, tags: ["목공", "체험", "원데이클래스"], openHours: "10:00 - 17:00" },
    // 소품샵·의류
    { name: "아트숍 소소", category: "shop", description: "헤이리 작가들의 작품을 소품으로 만나는 아트숍. 엽서, 포스터, 도자 소품.", positionX: 48, positionY: 50, tags: ["작가소품", "선물", "엽서"], openHours: "10:30 - 19:00" },
    { name: "린넨하우스", category: "shop", description: "내추럴 린넨 의류와 생활 소품 편집숍.", positionX: 58, positionY: 38, tags: ["의류", "린넨", "생활소품"], openHours: "11:00 - 19:00" },
    { name: "향기로운 비누가게", category: "shop", description: "천연 수제비누와 입욕제를 판매하는 가게. 만들기 체험도 가능.", positionX: 65, positionY: 48, tags: ["수제비누", "선물", "체험"], openHours: "10:00 - 19:00" },
    // 주차장
    { name: "제1주차장", category: "parking", description: "헤이리 정문 입구 대형 주차장. 약 200대 수용.", positionX: 15, positionY: 15, tags: ["주차", "정문"] },
    { name: "제2주차장", category: "parking", description: "헤이리 남측 주차장. 약 150대 수용. 주말 혼잡 시 이용 권장.", positionX: 40, positionY: 85, tags: ["주차", "남문"] },
    { name: "제3주차장", category: "parking", description: "헤이리 동측 소규모 주차장. 약 50대 수용.", positionX: 80, positionY: 60, tags: ["주차", "동문"] },
    // 화장실
    { name: "중앙 공용화장실", category: "restroom", description: "헤이리 중심부에 위치한 공용 화장실. 유아 동반 시설 완비.", positionX: 45, positionY: 48, tags: ["화장실", "기저귀교환대"] },
    { name: "북측 공용화장실", category: "restroom", description: "갤러리 밀집 구역 근처 공용 화장실.", positionX: 30, positionY: 30, tags: ["화장실"] },
    { name: "남측 공용화장실", category: "restroom", description: "제2주차장 인근 공용 화장실.", positionX: 42, positionY: 82, tags: ["화장실"] },
    // 편의시설
    { name: "헤이리 편의점", category: "convenience", description: "간식, 음료, 우산 등 필수품을 구매할 수 있는 마을 내 편의점.", positionX: 42, positionY: 42, tags: ["편의점", "간식", "음료"], openHours: "08:00 - 22:00" },
    { name: "헤이리 안내센터", category: "convenience", description: "마을 안내, 지도 배포, 분실물 접수를 담당하는 종합 안내센터.", positionX: 18, positionY: 20, tags: ["안내", "지도", "분실물"], openHours: "09:00 - 18:00" },
  ];

  // Insert stores (skip existing by name)
  const existingStores = await prisma.store.findMany({ select: { name: true } });
  const existingNames = new Set(existingStores.map((s) => s.name));
  const newStores = stores.filter((s) => !existingNames.has(s.name));

  if (newStores.length > 0) {
    await prisma.store.createMany({
      data: newStores.map((s) => ({
        name: s.name,
        category: s.category,
        description: s.description,
        story: s.story || null,
        positionX: s.positionX,
        positionY: s.positionY,
        tags: s.tags,
        openHours: s.openHours || null,
        isOpen: true,
      })),
    });
  }

  // 4. Gates
  const gates = [
    { name: "정문 (제1게이트)", positionX: 12, positionY: 12, description: "헤이리 주 출입구. 제1주차장 인접." },
    { name: "남문 (제2게이트)", positionX: 38, positionY: 90, description: "남측 출입구. 제2주차장 인접." },
    { name: "동문 (제3게이트)", positionX: 85, positionY: 55, description: "동측 출입구. 제3주차장 인접." },
    { name: "북문 (제4게이트)", positionX: 50, positionY: 5, description: "북측 소규모 출입구. 산책로 연결." },
  ];

  const existingGates = await prisma.gate.findMany({ select: { name: true } });
  const existingGateNames = new Set(existingGates.map((g) => g.name));
  const newGates = gates.filter((g) => !existingGateNames.has(g.name));

  if (newGates.length > 0) {
    await prisma.gate.createMany({ data: newGates, skipDuplicates: true });
  }

  // 5. Trails
  const trails = [
    {
      name: "메인 산책로",
      points: [
        { x: 12, y: 12 }, { x: 18, y: 20 }, { x: 25, y: 30 },
        { x: 35, y: 40 }, { x: 45, y: 48 }, { x: 55, y: 50 },
        { x: 65, y: 48 }, { x: 75, y: 45 }, { x: 85, y: 55 },
      ],
      isActive: true,
    },
    {
      name: "갤러리 순환 코스",
      points: [
        { x: 25, y: 40 }, { x: 35, y: 35 }, { x: 50, y: 30 },
        { x: 58, y: 25 }, { x: 70, y: 30 }, { x: 65, y: 40 },
        { x: 50, y: 60 }, { x: 35, y: 55 }, { x: 25, y: 40 },
      ],
      isActive: true,
    },
  ];

  const existingTrails = await prisma.trail.findMany({ select: { name: true } });
  const existingTrailNames = new Set(existingTrails.map((t) => t.name));
  const newTrails = trails.filter((t) => !existingTrailNames.has(t.name));

  if (newTrails.length > 0) {
    await prisma.trail.createMany({ data: newTrails, skipDuplicates: true });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
