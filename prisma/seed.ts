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

  // ──────────────────────────────────────────────
  // 6. Shop Owner Accounts (5개)
  // ──────────────────────────────────────────────
  const allStores = await prisma.store.findMany();
  const storeByName = (name: string) => allStores.find((s) => s.name === name);

  const ownerPassword = await bcrypt.hash("owner1234!", 10);

  const ownerStoreMap = [
    { email: "owner1@heyri.com", name: "포레스트 커피 점주", storeName: "포레스트 커피" },
    { email: "owner2@heyri.com", name: "도자공방 흙 점주", storeName: "도자공방 흙" },
    { email: "owner3@heyri.com", name: "숲속화덕피자 점주", storeName: "숲속화덕피자" },
    { email: "owner4@heyri.com", name: "블루메미술관 관장", storeName: "블루메미술관" },
    { email: "owner5@heyri.com", name: "가죽공방 손끝 점주", storeName: "가죽공방 손끝" },
  ];

  const shopOwners: Array<{ id: string; email: string; storeId: string | null }> = [];

  for (const o of ownerStoreMap) {
    const store = storeByName(o.storeName);
    if (!store) continue;
    const user = await prisma.user.upsert({
      where: { email: o.email },
      update: {},
      create: {
        email: o.email,
        password: ownerPassword,
        name: o.name,
        role: "SHOP_OWNER",
        storeId: store.id,
      },
    });
    shopOwners.push({ id: user.id, email: user.email, storeId: store.id });
  }

  // Helper to get owner/store id by store name
  const ownerByStore = (storeName: string) =>
    shopOwners.find((o) => o.storeId === storeByName(storeName)?.id);

  // Admin user for board posts
  const adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });

  // ──────────────────────────────────────────────
  // 7. Events (8개)
  // ──────────────────────────────────────────────
  const now = new Date();
  const addDays = (d: Date, days: number) => {
    const result = new Date(d);
    result.setDate(result.getDate() + days);
    return result;
  };

  const eventsData = [
    { title: "봄맞이 도자기 체험 할인", description: "봄을 맞아 물레 체험과 핸드빌딩 클래스를 20% 할인합니다. 예약 필수!", category: "workshop", storeName: "도자공방 흙", startDate: now, endDate: addDays(now, 7) },
    { title: "갤러리 카페 모먼트 신진작가전", description: "신진 작가 5인의 회화 및 사진 작품을 만나보세요. 작가와의 대화 세션 포함.", category: "exhibition", storeName: "갤러리 카페 모먼트", startDate: now, endDate: addDays(now, 14) },
    { title: "헤이리 플리마켓", description: "헤이리 마을 작가와 주민들이 참여하는 플리마켓. 수공예품, 빈티지, 먹거리 가득!", category: "fleamarket", storeName: "헤이리 안내센터", startDate: addDays(now, 3), endDate: addDays(now, 4) },
    { title: "블루메미술관 특별전: 빛과 그림자", description: "빛과 그림자를 주제로 한 설치 미술 특별전. 국내외 작가 10인 참여.", category: "exhibition", storeName: "블루메미술관", startDate: now, endDate: addDays(now, 30) },
    { title: "숲속화덕피자 런치 특가", description: "평일 런치 타임(11:30-14:00) 마르게리따 피자 + 음료 세트 15,000원!", category: "promotion", storeName: "숲속화덕피자", startDate: now, endDate: addDays(now, 7) },
    { title: "가죽공방 커플 원데이클래스", description: "커플이 함께 가죽 키링과 카드지갑을 만드는 원데이클래스. 사전 예약 필수.", category: "workshop", storeName: "가죽공방 손끝", startDate: addDays(now, 5), endDate: addDays(now, 5) },
    { title: "헤이리 로스터리 커핑 클래스", description: "싱글오리진 원두 4종을 비교 시음하며 커피의 풍미를 배우는 클래스.", category: "workshop", storeName: "헤이리 로스터리", startDate: addDays(now, 2), endDate: addDays(now, 2) },
    { title: "한길책박물관 저자 강연회", description: "『나무 도시』 저자 초청 강연. 건축과 자연의 공존에 대한 이야기.", category: "lecture", storeName: "한길책박물관", startDate: addDays(now, 7), endDate: addDays(now, 7) },
  ];

  const existingEvents = await prisma.event.findMany({ select: { title: true } });
  const existingEventTitles = new Set(existingEvents.map((e) => e.title));

  for (const ev of eventsData) {
    if (existingEventTitles.has(ev.title)) continue;
    const store = storeByName(ev.storeName);
    if (!store) continue;
    await prisma.event.create({
      data: {
        storeId: store.id,
        title: ev.title,
        description: ev.description,
        category: ev.category,
        startDate: ev.startDate,
        endDate: ev.endDate,
        isActive: true,
      },
    });
  }

  // ──────────────────────────────────────────────
  // 8. Board Posts (12개)
  // ──────────────────────────────────────────────
  const boardPostsData = [
    { title: "봄 시즌 신메뉴 출시!", content: "포레스트 커피에서 봄 한정 벚꽃 라떼와 딸기 크루아상을 선보입니다. 3월 한 달간 첫 주문 시 10% 할인!", category: "newmenu", ownerEmail: "owner1@heyri.com", storeName: "포레스트 커피" },
    { title: "3월 플리마켓 참여 점포 모집", content: "3월 넷째 주 토요일에 열리는 헤이리 플리마켓에 참여할 점포를 모집합니다. 수공예, 빈티지, 푸드 분야 누구나 신청 가능합니다.", category: "fleamarket", ownerEmail: "owner1@heyri.com", storeName: "포레스트 커피" },
    { title: "블루메미술관 특별전 안내", content: "빛과 그림자를 주제로 한 특별전이 한 달간 진행됩니다. 국내외 설치미술 작가 10인의 작품을 만나보세요. 매주 토요일 도슨트 투어 운영.", category: "exhibition", ownerEmail: "owner4@heyri.com", storeName: "블루메미술관" },
    { title: "주말 라이브 공연 안내", content: "매주 토요일 저녁 7시, 갤러리 카페 모먼트에서 어쿠스틱 라이브 공연이 열립니다. 음료 주문 시 무료 관람!", category: "performance", ownerEmail: "owner1@heyri.com", storeName: "갤러리 카페 모먼트" },
    { title: "헤이리마을 봄맞이 대청소 안내", content: "3월 마지막 일요일 오전 10시부터 마을 전체 대청소를 진행합니다. 자원봉사자 분들께 점심과 음료를 제공합니다.", category: "announcement", ownerEmail: null, storeName: null },
    { title: "도자공방 원데이클래스 예약 오픈", content: "4월 원데이클래스 예약이 시작되었습니다. 물레 체험, 핸드빌딩, 도자 페인팅 중 선택 가능합니다. 소요 시간 약 2시간.", category: "general", ownerEmail: "owner2@heyri.com", storeName: "도자공방 흙" },
    { title: "숲속화덕피자 신메뉴: 트러플 피자", content: "이탈리아산 트러플 오일을 듬뿍 올린 트러플 머쉬룸 피자가 출시되었습니다. 진한 풍미가 일품입니다.", category: "newmenu", ownerEmail: "owner3@heyri.com", storeName: "숲속화덕피자" },
    { title: "가죽공방 손끝 봄 신작 소개", content: "봄 컬러 베지터블 가죽으로 만든 카드지갑, 키링, 팔찌 신작을 소개합니다. 매장에서 직접 만져보세요.", category: "general", ownerEmail: "owner5@heyri.com", storeName: "가죽공방 손끝" },
    { title: "헤이리 로스터리 원두 할인 이벤트", content: "이달의 원두 에티오피아 예가체프를 20% 할인 판매합니다. 200g 소분 포장도 가능합니다.", category: "newmenu", ownerEmail: "owner1@heyri.com", storeName: "헤이리 로스터리" },
    { title: "현대어린이책미술관 봄 특별 프로그램", content: "어린이 대상 그림책 만들기 워크숍이 4월 매주 수요일에 진행됩니다. 5세~10세 대상, 사전 예약 필수.", category: "exhibition", ownerEmail: "owner4@heyri.com", storeName: "현대어린이책미술관" },
    { title: "포토갤러리 빛 사진 공모전", content: "헤이리 마을을 주제로 한 사진 공모전을 개최합니다. 입선작은 갤러리에 한 달간 전시됩니다. 접수 기간: 3월 20일~4월 10일.", category: "exhibition", ownerEmail: "owner4@heyri.com", storeName: "포토갤러리 빛" },
    { title: "캔들공방 향기 시즌 한정 클래스", content: "봄꽃 향을 담은 소이캔들 만들기 클래스를 오픈합니다. 벚꽃, 라일락, 프리지아 중 선택 가능. 약 1.5시간 소요.", category: "general", ownerEmail: "owner2@heyri.com", storeName: "캔들공방 향기" },
  ];

  const existingPosts = await prisma.boardPost.findMany({ select: { title: true } });
  const existingPostTitles = new Set(existingPosts.map((p) => p.title));

  for (const post of boardPostsData) {
    if (existingPostTitles.has(post.title)) continue;
    let authorId: string | undefined;
    if (post.ownerEmail === null) {
      authorId = adminUser?.id;
    } else {
      const owner = shopOwners.find((o) => o.email === post.ownerEmail);
      authorId = owner?.id;
    }
    if (!authorId) continue;

    const store = post.storeName ? storeByName(post.storeName) : null;
    await prisma.boardPost.create({
      data: {
        authorId,
        storeId: store?.id || null,
        title: post.title,
        content: post.content,
        category: post.category,
        images: [],
      },
    });
  }

  // ──────────────────────────────────────────────
  // 9. Stories (10개)
  // ──────────────────────────────────────────────
  const storyExpiry = addDays(now, 1); // 24 hours from now

  const storiesData = [
    { text: "오늘의 디저트: 딸기 크레이프 🍓 따뜻한 커피와 함께 즐겨보세요!", category: "menu", ownerEmail: "owner1@heyri.com", storeName: "포레스트 커피" },
    { text: "새로운 전시 작품이 도착했어요! 이번 주부터 관람 가능합니다.", category: "exhibition", ownerEmail: "owner4@heyri.com", storeName: "블루메미술관" },
    { text: "오늘 날씨가 좋아서 테라스 오픈했습니다 ☀️ 산책 후 들러주세요!", category: "daily", ownerEmail: "owner1@heyri.com", storeName: "포레스트 커피" },
    { text: "수제 파스타 만드는 중... 🍝 오늘의 스페셜은 봄나물 크림 파스타!", category: "menu", ownerEmail: "owner3@heyri.com", storeName: "숲속화덕피자" },
    { text: "가마에서 갓 꺼낸 도자기들 🏺 자연유약의 색감이 정말 아름다워요.", category: "craft", ownerEmail: "owner2@heyri.com", storeName: "도자공방 흙" },
    { text: "오늘 로스팅한 에티오피아 예가체프, 블루베리 향이 가득합니다 ☕", category: "menu", ownerEmail: "owner1@heyri.com", storeName: "헤이리 로스터리" },
    { text: "커플 가죽 키링 완성작! 세상에 하나뿐인 선물 💝", category: "craft", ownerEmail: "owner5@heyri.com", storeName: "가죽공방 손끝" },
    { text: "화덕에 장작 불 지피는 중 🔥 11시 30분부터 오픈합니다!", category: "daily", ownerEmail: "owner3@heyri.com", storeName: "숲속화덕피자" },
    { text: "도자 물레 체험 진행 중! 초보자도 멋진 작품을 만들 수 있어요 🎨", category: "craft", ownerEmail: "owner2@heyri.com", storeName: "도자공방 흙" },
    { text: "봄 신작 가죽 카드지갑 🌸 파스텔 컬러로 준비했어요.", category: "product", ownerEmail: "owner5@heyri.com", storeName: "가죽공방 손끝" },
  ];

  const existingStories = await prisma.story.count();
  if (existingStories === 0) {
    for (const s of storiesData) {
      const owner = shopOwners.find((o) => o.email === s.ownerEmail);
      const store = storeByName(s.storeName);
      if (!owner || !store) continue;
      await prisma.story.create({
        data: {
          authorId: owner.id,
          storeId: store.id,
          text: s.text,
          category: s.category,
          expiresAt: storyExpiry,
        },
      });
    }
  }

  // ──────────────────────────────────────────────
  // 10. Coupons (6개)
  // ──────────────────────────────────────────────
  const couponsData = [
    { title: "아메리카노 500원 할인", description: "아메리카노(핫/아이스) 주문 시 500원 할인. 1인 1회.", discount: "500원", storeName: "포레스트 커피", validUntil: addDays(now, 30) },
    { title: "체험 10% 할인", description: "도자기 원데이클래스 체험비 10% 할인. 사전 예약 시 적용.", discount: "10%", storeName: "도자공방 흙", validUntil: addDays(now, 30) },
    { title: "2인 식사 시 디저트 서비스", description: "2인 이상 식사 주문 시 수제 티라미수 1개 무료 제공.", discount: "디저트 무료", storeName: "숲속화덕피자", validUntil: addDays(now, 14) },
    { title: "전시 관람 20% 할인", description: "블루메미술관 특별전 관람료 20% 할인. 현장 제시 필수.", discount: "20%", storeName: "블루메미술관", validUntil: addDays(now, 30) },
    { title: "원두 1kg 구매 시 드립백 증정", description: "원두 1kg 구매 시 시그니처 드립백 5개 증정.", discount: "드립백 5개 증정", storeName: "헤이리 로스터리", validUntil: addDays(now, 21) },
    { title: "가죽 키링 만들기 무료 체험", description: "첫 방문 고객 대상 미니 가죽 키링 만들기 무료 체험. 소요 약 30분.", discount: "무료 체험", storeName: "가죽공방 손끝", validUntil: addDays(now, 30) },
  ];

  const existingCoupons = await prisma.coupon.findMany({ select: { title: true } });
  const existingCouponTitles = new Set(existingCoupons.map((c) => c.title));

  for (const c of couponsData) {
    if (existingCouponTitles.has(c.title)) continue;
    const store = storeByName(c.storeName);
    if (!store) continue;
    await prisma.coupon.create({
      data: {
        storeId: store.id,
        title: c.title,
        description: c.description,
        discount: c.discount,
        validUntil: c.validUntil,
        isActive: true,
      },
    });
  }

  // ──────────────────────────────────────────────
  // 11. Announcements (3개)
  // ──────────────────────────────────────────────
  const announcementsData = [
    { title: "헤이리마을 봄 축제 안내", content: "4월 첫째 주말, 헤이리마을 봄 축제가 열립니다! 라이브 공연, 플리마켓, 체험 부스 등 다양한 프로그램이 준비되어 있습니다. 주차장이 혼잡할 수 있으니 대중교통 이용을 권장합니다." },
    { title: "3월 넷째주 주차장 공사 안내", content: "제1주차장 노면 보수 공사로 인해 3월 넷째 주(3/24~3/28) 동안 제1주차장 이용이 제한됩니다. 제2, 제3주차장을 이용해주세요. 불편을 드려 죄송합니다." },
    { title: "타운헤이리 앱 오픈 안내", content: "헤이리마을 방문객을 위한 타운헤이리 서비스가 오픈했습니다! 마을 지도, 매장 정보, 이벤트, 쿠폰 등을 한눈에 확인하세요. 많은 이용 부탁드립니다." },
  ];

  const existingAnnouncements = await prisma.announcement.findMany({ select: { title: true } });
  const existingAnnouncementTitles = new Set(existingAnnouncements.map((a) => a.title));

  for (const a of announcementsData) {
    if (existingAnnouncementTitles.has(a.title)) continue;
    await prisma.announcement.create({
      data: {
        title: a.title,
        content: a.content,
        isActive: true,
      },
    });
  }

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
