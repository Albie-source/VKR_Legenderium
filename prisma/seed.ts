import "dotenv/config";
import { PrismaClient, PublishStatus, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { materials } from "./seedMaterials";

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
        shortDescription: material.shortDescription,
        fullText: material.fullText,
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
        title: `Мемо: найди одинаковые карточки`,
        description: "Сложный уровень: переверните карточки и найдите все 10 пар одинаковых картинок.",
        type: "memo",
        difficulty: "hard",
        config: {
          question: "Найдите все пары одинаковых карточек",
          cardBack: "/images/memo.png",
          pairs: [
            { id: "img1", cardA: "Карточка 1", cardB: "Карточка 1", image: "/images/memo/1.png" },
            { id: "img2", cardA: "Карточка 2", cardB: "Карточка 2", image: "/images/memo/2.png" },
            { id: "img3", cardA: "Карточка 3", cardB: "Карточка 3", image: "/images/memo/3.png" },
            { id: "img4", cardA: "Карточка 4", cardB: "Карточка 4", image: "/images/memo/4.png" },
            { id: "img5", cardA: "Карточка 5", cardB: "Карточка 5", image: "/images/memo/5.png" },
            { id: "img6", cardA: "Карточка 6", cardB: "Карточка 6", image: "/images/memo/6.png" },
            { id: "img7", cardA: "Карточка 7", cardB: "Карточка 7", image: "/images/memo/7.png" },
            { id: "img8", cardA: "Карточка 8", cardB: "Карточка 8", image: "/images/memo/8.png" },
            { id: "img9", cardA: "Карточка 9", cardB: "Карточка 9", image: "/images/memo/9.png" },
            { id: "img10", cardA: "Карточка 10", cardB: "Карточка 10", image: "/images/memo/10.png" },
          ],
          explanation: "Тренировка зрительной памяти: чем больше карточек, тем сложнее удержать в голове расположение пар.",
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

main()
  .catch((error) => {
    console.error("Ошибка при заполнении базы данных:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
