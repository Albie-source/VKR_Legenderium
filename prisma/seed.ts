import "dotenv/config";
import { PrismaClient, PublishStatus, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const regions = [
  {
    name: "Амурская область",
    description:
      "Регион Дальнего Востока России, связанный с культурами народов Приамурья, таёжными сюжетами и преданиями о духах природы.",
  },
  {
    name: "Камчатский край",
    description:
      "Регион вулканов, океана и северных традиций, где важное место занимают мифы о происхождении огня, гор и морских существ.",
  },
  {
    name: "Республика Бурятия",
    description:
      "Регион у Байкала, где фольклор связан с природными духами, шаманскими представлениями, преданиями о воде и горах.",
  },
  {
    name: "Республика Саха (Якутия)",
    description:
      "Крупнейший регион России, известный богатой эпической традицией олонхо, мифами о холоде, небе, героях и духах.",
  },
  {
    name: "Приморский край",
    description:
      "Южный регион Дальнего Востока, где пересекаются морские, таёжные и этнокультурные мотивы.",
  },
  {
    name: "Хабаровский край",
    description:
      "Регион бассейна Амура, связанный с фольклором нанайцев, ульчей, нивхов и других народов.",
  },
  {
    name: "Магаданская область",
    description:
      "Северо-восточный регион России с фольклорными сюжетами о море, тундре, северном сиянии и духах местности.",
  },
  {
    name: "Сахалинская область",
    description:
      "Островной регион, связанный с мифологией нивхов и других народов, а также с сюжетами о море и рыболовстве.",
  },
  {
    name: "Чукотский автономный округ",
    description:
      "Северо-восточная территория России, где важную роль играют мифы о море, животных, вороне-творце и происхождении мира.",
  },
  {
    name: "Забайкальский край",
    description:
      "Регион степей и гор, связанный с бурятскими, эвенкийскими и русскими фольклорными традициями.",
  },
  {
    name: "Республика Коми",
    description:
      "Северный регион России с богатой мифологией, преданиями о лесных духах, домашних духах и сказочными сюжетами.",
  },
  {
    name: "Республика Карелия",
    description:
      "Регион северо-запада России, известный эпическими, песенными и сказочными традициями.",
  },
  {
    name: "Республика Татарстан",
    description:
      "Регион с богатым татарским фольклором, сказками, легендами, героическими преданиями и образами батыров.",
  },
  {
    name: "Республика Башкортостан",
    description:
      "Регион с развитой эпической традицией, легендами о батырах, горах, курае и природных объектах.",
  },
  {
    name: "Удмуртская Республика",
    description:
      "Регион Поволжья и Предуралья, где сохранились мифологические представления, календарные обряды и предания.",
  },
  {
    name: "Республика Марий Эл",
    description:
      "Регион, связанный с марийскими обрядами, священными рощами, лесными сюжетами и народной мифологией.",
  },
  {
    name: "Республика Мордовия",
    description:
      "Регион проживания мордовских народов эрзя и мокша, богатый сказками, семейными преданиями и календарными обрядами.",
  },
  {
    name: "Красноярский край",
    description:
      "Крупный сибирский регион, связанный с традициями эвенков, долган, кетов и других народов.",
  },
  {
    name: "Иркутская область",
    description:
      "Регион Прибайкалья, связанный с русскими, бурятскими и эвенкийскими фольклорными традициями.",
  },
  {
    name: "Ханты-Мансийский автономный округ",
    description:
      "Регион Западной Сибири, связанный с культурой ханты и манси, мифами о природе, животных и духах.",
  },
];

const peoples = [
  {
    name: "Эвенки",
    description:
      "Тунгусо-маньчжурский народ, традиционно связанный с охотой, оленеводством и таёжной культурой.",
  },
  {
    name: "Коряки",
    description:
      "Коренной народ Камчатки и северо-востока России, в фольклоре которого важны сюжеты о море, животных и огне.",
  },
  {
    name: "Буряты",
    description:
      "Монгольский народ, проживающий в Прибайкалье и Забайкалье, обладающий богатой мифологической и эпической традицией.",
  },
  {
    name: "Якуты",
    description:
      "Народ Республики Саха, известный эпосом олонхо и развитой системой мифологических представлений.",
  },
  {
    name: "Нанайцы",
    description:
      "Коренной народ Приамурья, фольклор которого связан с рекой, тайгой, животными и духами природы.",
  },
  {
    name: "Ульчи",
    description:
      "Народ Нижнего Амура, в традиционной культуре которого важны рыболовство, охота и предания о природе.",
  },
  {
    name: "Нивхи",
    description:
      "Народ Сахалина и Нижнего Амура, фольклор которого связан с морем, рыбой, медведем и духами.",
  },
  {
    name: "Чукчи",
    description:
      "Коренной народ Чукотки, в мифологии которого часто встречаются образы ворона, моря и северных животных.",
  },
  {
    name: "Ительмены",
    description:
      "Коренной народ Камчатки, в традициях которого представлены мифы о вулканах, животных и происхождении мира.",
  },
  {
    name: "Коми",
    description:
      "Финно-угорский народ северо-востока Европейской России с богатой сказочной и мифологической традицией.",
  },
  {
    name: "Карелы",
    description:
      "Финно-угорский народ северо-запада России, известный эпическими, песенными и сказочными традициями.",
  },
  {
    name: "Татары",
    description:
      "Тюркский народ с богатой традицией сказок, легенд, исторических преданий и образов героев-батыров.",
  },
  {
    name: "Башкиры",
    description:
      "Тюркский народ Южного Урала, в фольклоре которого заметны героические, горные и музыкальные мотивы.",
  },
  {
    name: "Удмурты",
    description:
      "Финно-угорский народ Предуралья, в традиционной культуре которого важны календарные обряды и мифологические персонажи.",
  },
  {
    name: "Марийцы",
    description:
      "Финно-угорский народ Поволжья, чья культура связана со священными рощами, обрядами и лесной мифологией.",
  },
  {
    name: "Мордва",
    description:
      "Обобщённое название эрзи и мокши, народов с богатыми сказочными, песенными и семейно-обрядовыми традициями.",
  },
  {
    name: "Эвенцы",
    description:
      "Тунгусо-маньчжурский народ северо-востока Сибири с традициями оленеводства, охоты и северных преданий.",
  },
  {
    name: "Долганы",
    description:
      "Тюркский народ Таймыра, фольклор которого связан с тундрой, оленями, севером и кочевой культурой.",
  },
  {
    name: "Ханты",
    description:
      "Угорский народ Западной Сибири, традиции которого связаны с природными духами, медвежьим культом и реками.",
  },
  {
    name: "Манси",
    description:
      "Угорский народ Урала и Западной Сибири, обладающий мифами о животных, духах и священных местах.",
  },
];

const genres = [
  {
    name: "Легенда",
    description:
      "Повествовательный жанр, объясняющий происхождение мест, явлений, персонажей или культурных традиций.",
  },
  {
    name: "Миф",
    description:
      "Древний повествовательный жанр, связанный с представлениями о происхождении мира, природных сил и человека.",
  },
  {
    name: "Сказка",
    description:
      "Жанр устного народного творчества с вымышленным сюжетом, испытаниями и нравственным смыслом.",
  },
  {
    name: "Предание",
    description:
      "Повествование о событиях прошлого, народных героях, памятных местах и культурной памяти сообщества.",
  },
  {
    name: "Обрядовый текст",
    description:
      "Фольклорный текст, связанный с календарными, семейными, охотничьими или иными обрядами.",
  },
  {
    name: "Эпос",
    description:
      "Крупная повествовательная форма, связанная с героическими сюжетами, подвигами и культурными ценностями народа.",
  },
  {
    name: "Быличка",
    description:
      "Краткий рассказ о встрече человека с необычным, сверхъестественным или мифологическим существом.",
  },
  {
    name: "Песня",
    description:
      "Фольклорный жанр, в котором текст соединяется с музыкальным исполнением и традиционной поэтикой.",
  },
  {
    name: "Заговор",
    description:
      "Ритуально-словесная формула, связанная с представлениями о силе слова и магическом воздействии.",
  },
];

const topics = [
  "Духи природы",
  "Происхождение мира",
  "Животные",
  "Огонь",
  "Вода",
  "Лес",
  "Горы",
  "Солнце и луна",
  "Герои",
  "Обряды",
  "Путешествие",
  "Испытание",
  "Семья",
  "Охота",
  "Море",
  "Домашние духи",
  "Священные места",
  "Северное сияние",
  "Птицы",
  "Медведь",
];

const materials = [
  {
    title: "Легенда о духе тайги",
    region: "Амурская область",
    people: "Эвенки",
    genre: "Легенда",
    topics: ["Духи природы", "Лес", "Охота"],
    latitude: 53.2,
    longitude: 127.5,
  },
  {
    title: "Миф о рождении реки",
    region: "Амурская область",
    people: "Эвенки",
    genre: "Миф",
    topics: ["Вода", "Происхождение мира"],
    latitude: 52.8,
    longitude: 128.7,
  },
  {
    title: "Сказка о таёжном охотнике",
    region: "Амурская область",
    people: "Эвенки",
    genre: "Сказка",
    topics: ["Охота", "Лес", "Испытание"],
    latitude: 53.7,
    longitude: 126.9,
  },
  {
    title: "Быличка о ночном огне у Амура",
    region: "Амурская область",
    people: "Эвенки",
    genre: "Быличка",
    topics: ["Огонь", "Духи природы"],
    latitude: 52.4,
    longitude: 127.8,
  },
  {
    title: "Миф о происхождении огня",
    region: "Камчатский край",
    people: "Коряки",
    genre: "Миф",
    topics: ["Огонь", "Происхождение мира"],
    latitude: 56.1,
    longitude: 160.1,
  },
  {
    title: "Легенда о вулкане",
    region: "Камчатский край",
    people: "Ительмены",
    genre: "Легенда",
    topics: ["Горы", "Огонь"],
    latitude: 55.9,
    longitude: 158.7,
  },
  {
    title: "Предание о морском звере",
    region: "Камчатский край",
    people: "Коряки",
    genre: "Предание",
    topics: ["Море", "Животные"],
    latitude: 57.0,
    longitude: 159.4,
  },
  {
    title: "Сказка о каменном вороне",
    region: "Камчатский край",
    people: "Ительмены",
    genre: "Сказка",
    topics: ["Птицы", "Горы", "Испытание"],
    latitude: 54.8,
    longitude: 160.6,
  },
  {
    title: "Сказание о Байкале",
    region: "Республика Бурятия",
    people: "Буряты",
    genre: "Предание",
    topics: ["Вода", "Горы"],
    latitude: 53.5,
    longitude: 108.1,
  },
  {
    title: "Легенда о шаманском бубне",
    region: "Республика Бурятия",
    people: "Буряты",
    genre: "Легенда",
    topics: ["Обряды", "Духи природы"],
    latitude: 52.3,
    longitude: 107.8,
  },
  {
    title: "Сказка о мудрой старухе",
    region: "Республика Бурятия",
    people: "Буряты",
    genre: "Сказка",
    topics: ["Семья", "Герои"],
    latitude: 51.8,
    longitude: 107.6,
  },
  {
    title: "Миф о хозяине горного перевала",
    region: "Республика Бурятия",
    people: "Буряты",
    genre: "Миф",
    topics: ["Горы", "Духи природы"],
    latitude: 52.9,
    longitude: 109.2,
  },
  {
    title: "Песня северного ветра",
    region: "Республика Саха (Якутия)",
    people: "Якуты",
    genre: "Песня",
    topics: ["Духи природы", "Солнце и луна"],
    latitude: 62.0,
    longitude: 129.7,
  },
  {
    title: "Легенда о ледяной дороге",
    region: "Республика Саха (Якутия)",
    people: "Якуты",
    genre: "Легенда",
    topics: ["Путешествие", "Испытание"],
    latitude: 64.3,
    longitude: 126.8,
  },
  {
    title: "Эпос о северном герое",
    region: "Республика Саха (Якутия)",
    people: "Якуты",
    genre: "Эпос",
    topics: ["Герои", "Испытание"],
    latitude: 63.4,
    longitude: 130.0,
  },
  {
    title: "Миф о небесной упряжке",
    region: "Республика Саха (Якутия)",
    people: "Якуты",
    genre: "Миф",
    topics: ["Солнце и луна", "Животные"],
    latitude: 61.6,
    longitude: 128.5,
  },
  {
    title: "Легенда о каменной птице",
    region: "Приморский край",
    people: "Нанайцы",
    genre: "Легенда",
    topics: ["Животные", "Птицы", "Горы"],
    latitude: 44.8,
    longitude: 132.0,
  },
  {
    title: "Быличка о ночном огне",
    region: "Приморский край",
    people: "Нанайцы",
    genre: "Быличка",
    topics: ["Огонь", "Духи природы"],
    latitude: 45.3,
    longitude: 133.1,
  },
  {
    title: "Предание о морской тропе",
    region: "Приморский край",
    people: "Нанайцы",
    genre: "Предание",
    topics: ["Море", "Путешествие"],
    latitude: 43.8,
    longitude: 131.9,
  },
  {
    title: "Сказка о тигре и охотнике",
    region: "Приморский край",
    people: "Нанайцы",
    genre: "Сказка",
    topics: ["Животные", "Охота", "Испытание"],
    latitude: 45.9,
    longitude: 134.2,
  },
  {
    title: "Сказка о хитрой лисе",
    region: "Хабаровский край",
    people: "Ульчи",
    genre: "Сказка",
    topics: ["Животные", "Испытание"],
    latitude: 50.5,
    longitude: 136.9,
  },
  {
    title: "Миф о первом медведе",
    region: "Хабаровский край",
    people: "Нанайцы",
    genre: "Миф",
    topics: ["Животные", "Медведь", "Происхождение мира"],
    latitude: 49.0,
    longitude: 136.2,
  },
  {
    title: "Предание о хозяине Амура",
    region: "Хабаровский край",
    people: "Ульчи",
    genre: "Предание",
    topics: ["Вода", "Духи природы"],
    latitude: 51.1,
    longitude: 135.4,
  },
  {
    title: "Обрядовая песня рыбаков",
    region: "Хабаровский край",
    people: "Нанайцы",
    genre: "Обрядовый текст",
    topics: ["Обряды", "Море", "Вода"],
    latitude: 48.7,
    longitude: 137.5,
  },
  {
    title: "Миф о вороне-творце",
    region: "Чукотский автономный округ",
    people: "Чукчи",
    genre: "Миф",
    topics: ["Происхождение мира", "Животные", "Птицы"],
    latitude: 64.7,
    longitude: 177.5,
  },
  {
    title: "Предание о белом ките",
    region: "Чукотский автономный округ",
    people: "Чукчи",
    genre: "Предание",
    topics: ["Море", "Животные"],
    latitude: 66.1,
    longitude: 172.3,
  },
  {
    title: "Сказка о северном олене",
    region: "Чукотский автономный округ",
    people: "Чукчи",
    genre: "Сказка",
    topics: ["Животные", "Путешествие"],
    latitude: 65.4,
    longitude: 175.8,
  },
  {
    title: "Легенда о крае льда",
    region: "Чукотский автономный округ",
    people: "Чукчи",
    genre: "Легенда",
    topics: ["Северное сияние", "Духи природы"],
    latitude: 67.0,
    longitude: 178.0,
  },
  {
    title: "Быличка о лесном человеке",
    region: "Республика Коми",
    people: "Коми",
    genre: "Быличка",
    topics: ["Лес", "Духи природы"],
    latitude: 63.8,
    longitude: 54.3,
  },
  {
    title: "Коми быличка о духе дома",
    region: "Республика Коми",
    people: "Коми",
    genre: "Быличка",
    topics: ["Домашние духи", "Семья"],
    latitude: 62.5,
    longitude: 55.1,
  },
  {
    title: "Легенда о северной реке",
    region: "Республика Коми",
    people: "Коми",
    genre: "Легенда",
    topics: ["Вода", "Путешествие"],
    latitude: 64.4,
    longitude: 53.0,
  },
  {
    title: "Сказка о медвежьей тропе",
    region: "Республика Коми",
    people: "Коми",
    genre: "Сказка",
    topics: ["Медведь", "Лес", "Испытание"],
    latitude: 61.9,
    longitude: 56.0,
  },
  {
    title: "Сказка о батыре и змее",
    region: "Республика Татарстан",
    people: "Татары",
    genre: "Сказка",
    topics: ["Герои", "Испытание"],
    latitude: 55.7,
    longitude: 49.1,
  },
  {
    title: "Сказка о девушке-лебеде",
    region: "Республика Татарстан",
    people: "Татары",
    genre: "Сказка",
    topics: ["Животные", "Семья", "Птицы"],
    latitude: 55.2,
    longitude: 50.0,
  },
  {
    title: "Предание о древнем городе",
    region: "Республика Татарстан",
    people: "Татары",
    genre: "Предание",
    topics: ["Герои", "Путешествие"],
    latitude: 55.8,
    longitude: 48.8,
  },
  {
    title: "Легенда о волшебном озере",
    region: "Республика Татарстан",
    people: "Татары",
    genre: "Легенда",
    topics: ["Вода", "Духи природы"],
    latitude: 54.9,
    longitude: 49.7,
  },
  {
    title: "Миф о солнце и луне",
    region: "Ханты-Мансийский автономный округ",
    people: "Ханты",
    genre: "Миф",
    topics: ["Солнце и луна", "Происхождение мира"],
    latitude: 61.0,
    longitude: 69.0,
  },
  {
    title: "Предание о медвежьем празднике",
    region: "Ханты-Мансийский автономный округ",
    people: "Манси",
    genre: "Обрядовый текст",
    topics: ["Животные", "Медведь", "Обряды"],
    latitude: 62.2,
    longitude: 65.4,
  },
  {
    title: "Легенда о речном духе",
    region: "Ханты-Мансийский автономный округ",
    people: "Ханты",
    genre: "Легенда",
    topics: ["Вода", "Духи природы"],
    latitude: 60.6,
    longitude: 70.2,
  },
  {
    title: "Сказка о лесной хозяйке",
    region: "Ханты-Мансийский автономный округ",
    people: "Манси",
    genre: "Сказка",
    topics: ["Лес", "Духи природы", "Испытание"],
    latitude: 61.7,
    longitude: 67.8,
  },
];

async function main() {
  console.log("Начинаю заполнение базы данных...");

  await clearDatabase();

  const bcrypt = await import("bcryptjs");
  const adminHash = await bcrypt.hash("admin123", 10);
  const userHash  = await bcrypt.hash("user123",  10);

  const admin = await prisma.user.create({
    data: {
      name: "Администратор",
      email: "admin@legendarium.ru",
      passwordHash: adminHash,
      role: UserRole.ADMIN,
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      name: "Пользователь",
      email: "user@legendarium.ru",
      passwordHash: userHash,
      role: UserRole.USER,
    },
  });

  for (const region of regions) {
    await prisma.region.create({
      data: region,
    });
  }

  for (const people of peoples) {
    await prisma.people.create({
      data: people,
    });
  }

  for (const genre of genres) {
    await prisma.genre.create({
      data: genre,
    });
  }

  for (const topicName of topics) {
    await prisma.topic.create({
      data: {
        name: topicName,
      },
    });
  }

  const source = await prisma.source.create({
    data: {
      title: "Демонстрационный набор фольклорных материалов",
      author: "Легендариум",
      year: 2026,
      type: "учебный материал",
      url: null,
    },
  });

  const createdMaterials: {
    id: number;
    title: string;
    genre: string;
    topics: string[];
    imageUrl: string | null;
  }[] = [];

  for (const [index, material] of materials.entries()) {
    const region = await prisma.region.findFirstOrThrow({
      where: {
        name: material.region,
      },
    });

    const people = await prisma.people.findFirstOrThrow({
      where: {
        name: material.people,
      },
    });

    const genre = await prisma.genre.findFirstOrThrow({
      where: {
        name: material.genre,
      },
    });

    const createdMaterial = await prisma.material.create({
      data: {
        title: material.title,
        shortDescription: makeShortDescription(
          material.title,
          material.region,
          material.people
        ),
        fullText: makeFullText(material.title, material.region, material.people),
        latitude: material.latitude,
        longitude: material.longitude,
        imageUrl: getMaterialImage(index),
        audioUrl: null,
        videoUrl: null,
        status: PublishStatus.PUBLISHED,
        regionId: region.id,
        peopleId: people.id,
        genreId: genre.id,
        sourceId: source.id,
        createdById: admin.id,
      },
    });

    for (const topicName of material.topics) {
      const topic = await prisma.topic.findFirstOrThrow({
        where: {
          name: topicName,
        },
      });

      await prisma.materialTopic.create({
        data: {
          materialId: createdMaterial.id,
          topicId: topic.id,
        },
      });
    }

    createdMaterials.push({
      id: createdMaterial.id,
      title: createdMaterial.title,
      genre: material.genre,
      topics: material.topics,
      imageUrl: createdMaterial.imageUrl,
    });
  }

  await createDemoTasks(createdMaterials);
  await createDemoGoals();
  await createDemoFavorite(demoUser.id, createdMaterials[0]?.id);

  console.log("База данных успешно заполнена.");
  console.log("Администратор: admin@legendarium.ru / admin123");
  console.log("Пользователь: user@legendarium.ru / user123");
}

async function clearDatabase() {
  await prisma.goalProgress.deleteMany();
  await prisma.taskAttempt.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.interactiveTask.deleteMany();
  await prisma.materialTopic.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.material.deleteMany();
  await prisma.source.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.people.deleteMany();
  await prisma.region.deleteMany();
  await prisma.user.deleteMany();
}

async function createDemoTasks(
  createdMaterials: {
    id: number;
    title: string;
    genre: string;
    topics: string[];
    imageUrl: string | null;
  }[]
) {
  const taskMaterials = createdMaterials.slice(0, 8);

  for (const [index, material] of taskMaterials.entries()) {
    if (index < 4) {
      await prisma.interactiveTask.create({
        data: {
          materialId: material.id,
          title: `Задание по материалу «${material.title}»`,
          description:
            "Ответьте на вопрос по содержанию фольклорного материала и проверьте понимание основной идеи.",
          type: "single_choice",
          difficulty: "easy",
          config: {
            question: `С какой темой связан материал «${material.title}»?`,
            options: [
              material.topics[0] ?? "Духи природы",
              "Городская архитектура",
              "Космические технологии",
              "Современная реклама",
            ],
            correctAnswer: material.topics[0] ?? "Духи природы",
            explanation:
              "Правильный ответ связан с тематикой, указанной в карточке фольклорного материала.",
          },
        },
      });

      continue;
    }

    await prisma.interactiveTask.create({
      data: {
        materialId: material.id,
        title: `Сопоставление по материалу «${material.title}»`,
        description:
          "Соотнесите фольклорные образы с их значением в традиционной культуре.",
        type: "matching",
        difficulty: "medium",
        config: {
          question: "Соотнесите образ и его значение.",
          pairs: [
            {
              left: "Дух леса",
              right: "Хранитель природного пространства",
            },
            {
              left: "Огонь",
              right: "Дар, связанный с жизнью и защитой",
            },
            {
              left: "Птица",
              right: "Посредник между мирами",
            },
            {
              left: "Герой",
              right: "Персонаж, проходящий испытание",
            },
          ],
          explanation:
            "В фольклоре образы природы, животных и героев помогают объяснить устройство мира, запреты, традиционные правила поведения и связь человека с окружающей средой.",
        },
      },
    });
  }

  // New interactive task types — one example each, attached to the first material
  const baseMaterial = createdMaterials[0];
  if (baseMaterial) {
    await prisma.interactiveTask.create({
      data: {
        materialId: baseMaterial.id,
        title: `Визуальная новелла: путь героя`,
        description: "Пройдите историю и сделайте правильный выбор.",
        type: "visual_novel",
        difficulty: "medium",
        config: {
          scenes: [
            {
              id: "start",
              text: "Охотник вошёл в тёмный лес. У развилки он увидел старика, который предложил ему два пути: левый — через болото, правый — через гору. Что выберет охотник?",
              choices: [
                { text: "Пойти через болото", nextScene: "swamp" },
                { text: "Пойти через гору", nextScene: "mountain" },
              ],
            },
            {
              id: "swamp",
              text: "В болоте охотник встретил духа воды. Дух спросил: «Зачем ты пришёл в мои владения?» Охотник ответил уважительно и получил совет. Он нашёл путь домой.",
              isEnd: true,
              isCorrect: true,
            },
            {
              id: "mountain",
              text: "На горе разразилась буря. Охотник заблудился и вернулся на развилку ни с чем.",
              isEnd: true,
              isCorrect: false,
            },
          ],
          explanation: "В фольклоре болото часто связано с духами, которые помогают уважительным путникам. Правильный выбор — проявить уважение к природе.",
        },
      },
    });

    await prisma.interactiveTask.create({
      data: {
        materialId: baseMaterial.id,
        title: `Найдите скрытые объекты`,
        description: "Кликайте на изображение, чтобы найти спрятанные фольклорные символы.",
        type: "hidden_objects",
        difficulty: "easy",
        config: {
          question: "Найдите три фольклорных символа на картине",
          imageUrl: baseMaterial.imageUrl ?? "/materials/1.png",
          objects: [
            { id: "o1", label: "Дерево-великан", x: 15, y: 35, radius: 12 },
            { id: "o2", label: "Огонь", x: 60, y: 70, radius: 10 },
            { id: "o3", label: "Птица", x: 80, y: 25, radius: 10 },
          ],
          explanation: "Дерево, огонь и птица — три ключевых символа в фольклоре народов Сибири.",
        },
      },
    });

    await prisma.interactiveTask.create({
      data: {
        materialId: baseMaterial.id,
        title: `Кто я? Угадай персонажа`,
        description: "Узнайте фольклорного персонажа по подсказкам.",
        type: "who_am_i",
        difficulty: "medium",
        config: {
          clues: [
            "Я живу в лесу и охраняю его от чужаков.",
            "Меня боятся охотники и заблудившиеся путники.",
            "Я могу менять облик и запутывать дороги.",
            "В некоторых легендах я помогаю тем, кто знает правильные слова.",
          ],
          answer: "Леший",
          options: ["Леший", "Водяной", "Домовой", "Банник"],
          explanation: "Леший — дух-хозяин леса в славянской мифологии. Он охраняет лес, может заводить людей в чащу, но иногда помогает уважительным путникам.",
        },
      },
    });

    await prisma.interactiveTask.create({
      data: {
        materialId: baseMaterial.id,
        title: `Мемо: фольклорные пары`,
        description: "Найдите пары карточек: символ и его значение в фольклоре.",
        type: "memo",
        difficulty: "easy",
        config: {
          question: "Найдите пары: фольклорный образ и его значение",
          pairs: [
            { id: "p1", cardA: "Медведь", cardB: "Хозяин тайги" },
            { id: "p2", cardA: "Огонь", cardB: "Священный дар" },
            { id: "p3", cardA: "Ворон", cardB: "Вестник перемен" },
            { id: "p4", cardA: "Вода", cardB: "Граница миров" },
          ],
          explanation: "В фольклоре народов Севера животные и природные стихии несут глубокий символический смысл.",
        },
      },
    });

    await prisma.interactiveTask.create({
      data: {
        materialId: baseMaterial.id,
        title: `Собери образ: традиционный костюм`,
        description: "Выберите правильные элементы традиционного костюма народа.",
        type: "assemble_outfit",
        difficulty: "medium",
        config: {
          question: "Соберите традиционный женский костюм народов Поволжья",
          character: "Девушка из Татарстана",
          slots: [
            { id: "head", label: "Головной убор", correctItem: "Калфак" },
            { id: "outer", label: "Верхняя одежда", correctItem: "Камзол" },
            { id: "dress", label: "Основное платье", correctItem: "Күлмәк (рубаха-платье)" },
            { id: "shoes", label: "Обувь", correctItem: "Читек (мягкие сапоги)" },
          ],
          items: [
            { id: "i1", label: "Калфак", slotId: "head" },
            { id: "i2", label: "Кокошник", slotId: "head" },
            { id: "i3", label: "Камзол", slotId: "outer" },
            { id: "i4", label: "Шуба", slotId: "outer" },
            { id: "i5", label: "Күлмәк (рубаха-платье)", slotId: "dress" },
            { id: "i6", label: "Сарафан", slotId: "dress" },
            { id: "i7", label: "Читек (мягкие сапоги)", slotId: "shoes" },
            { id: "i8", label: "Лапти", slotId: "shoes" },
          ],
          explanation: "Калфак, камзол, күлмәк и читек — традиционные элементы женского татарского костюма, отражающие богатую культуру народа.",
        },
      },
    });
  }
}

async function createDemoGoals() {
  const legend = await prisma.genre.findFirst({
    where: {
      name: "Легенда",
    },
  });

  const fairyTale = await prisma.genre.findFirst({
    where: {
      name: "Сказка",
    },
  });

  const spirits = await prisma.topic.findFirst({
    where: {
      name: "Духи природы",
    },
  });

  const animals = await prisma.topic.findFirst({
    where: {
      name: "Животные",
    },
  });

  const rituals = await prisma.topic.findFirst({
    where: {
      name: "Обряды",
    },
  });

  const ritualGenre = await prisma.genre.findFirst({
    where: {
      name: "Обрядовый текст",
    },
  });

  if (legend && spirits) {
    await prisma.goal.create({
      data: {
        title: "Знаток легенд о духах",
        description:
          "Изучи материалы, связанные с духами природы, и выполни задания к ним.",
        requiredMaterialsCount: 3,
        cardTitle: "Хранитель тайги",
        cardImageUrl: "/materials/1.png",
        genres: { create: { genreId: legend.id } },
        topics: { create: { topicId: spirits.id } },
      },
    });
  }

  if (fairyTale && animals) {
    await prisma.goal.create({
      data: {
        title: "Следопыт сказочных зверей",
        description:
          "Изучи сказочные материалы, в которых встречаются животные и птицы.",
        requiredMaterialsCount: 3,
        cardTitle: "Следопыт лесных троп",
        cardImageUrl: "/materials/2.png",
        genres: { create: { genreId: fairyTale.id } },
        topics: { create: { topicId: animals.id } },
      },
    });
  }

  if (rituals && ritualGenre) {
    await prisma.goal.create({
      data: {
        title: "Исследователь обрядов",
        description:
          "Познакомься с материалами, связанными с обрядами и традиционными действиями.",
        requiredMaterialsCount: 2,
        cardTitle: "Хранитель традиций",
        cardImageUrl: "/materials/3.png",
        genres: { create: { genreId: ritualGenre.id } },
        topics: { create: { topicId: rituals.id } },
      },
    });
  }
}

async function createDemoFavorite(userId: number, materialId?: number) {
  if (!materialId) {
    return;
  }

  await prisma.favorite.create({
    data: {
      userId,
      materialId,
    },
  });
}

function getMaterialImage(index: number) {
  const imageNumber = (index % 25) + 1;
  return `/materials/${imageNumber}.png`;
}

function makeShortDescription(
  title: string,
  regionName: string,
  peopleName: string
) {
  return `${title} — фольклорный материал народа ${peopleName}, связанный с культурной традицией региона ${regionName}.`;
}

function makeFullText(title: string, regionName: string, peopleName: string) {
  return `Фольклорный материал «${title}» относится к традициям народа ${peopleName} и связан с территорией региона ${regionName}.

В подобных сюжетах отражаются представления человека о природе, семье, труде, происхождении мира и взаимодействии с окружающей средой. Через образы духов, животных, героев и природных явлений народная традиция объясняет важные правила поведения и передаёт опыт старших поколений.

Сюжет материала раскрывает важную для традиционной культуры идею: человек не существует отдельно от мира природы. Лес, вода, огонь, животные и небесные светила воспринимаются как живые силы, требующие уважительного отношения. Нарушение запретов обычно приводит героя к испытанию, а соблюдение традиционных правил помогает восстановить равновесие.

Материал может использоваться для ознакомления с культурой народов России, анализа мотивов устного народного творчества и выполнения интерактивных заданий на платформе «Легендариум».`;
}

main()
  .catch((error) => {
    console.error("Ошибка при заполнении базы данных:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
