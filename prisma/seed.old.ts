import "dotenv/config";
import { PrismaClient, PublishStatus, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Чтобы seed можно было запускать повторно
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

  const admin = await prisma.user.create({
    data: {
      name: "Администратор",
      email: "admin@legendarium.ru",
      passwordHash: "admin123",
      role: UserRole.ADMIN,
    },
  });

  const amur = await prisma.region.create({
    data: {
      name: "Амурская область",
      description:
        "Регион Дальнего Востока России, связанный с культурой народов Приамурья.",
    },
  });

  const yakutia = await prisma.region.create({
    data: {
      name: "Республика Саха (Якутия)",
      description:
        "Крупнейший регион России, богатый мифологическими и эпическими традициями.",
    },
  });

  const kamchatka = await prisma.region.create({
    data: {
      name: "Камчатский край",
      description:
        "Регион с богатым наследием коренных народов Севера и Дальнего Востока.",
    },
  });

  const evenki = await prisma.people.create({
    data: {
      name: "Эвенки",
      description:
        "Тунгусо-маньчжурский народ, традиционно связанный с охотой, оленеводством и таёжной культурой.",
    },
  });

  const yakuts = await prisma.people.create({
    data: {
      name: "Якуты",
      description:
        "Народ Республики Саха, обладающий развитой эпической и мифологической традицией.",
    },
  });

  const koryaks = await prisma.people.create({
    data: {
      name: "Коряки",
      description:
        "Коренной народ Камчатки и северо-востока России.",
    },
  });

  const legend = await prisma.genre.create({
    data: {
      name: "Легенда",
      description:
        "Фольклорный жанр, связанный с объяснением происхождения мест, явлений, образов и событий.",
    },
  });

  const fairyTale = await prisma.genre.create({
    data: {
      name: "Сказка",
      description:
        "Повествовательный жанр устного народного творчества с вымышленным сюжетом.",
    },
  });

  const myth = await prisma.genre.create({
    data: {
      name: "Миф",
      description:
        "Традиционное повествование, объясняющее устройство мира, происхождение природных явлений и духов.",
    },
  });

  const spirits = await prisma.topic.create({
    data: {
      name: "Духи",
      description:
        "Материалы, связанные с представлениями о духах природы, дома, леса, воды и огня.",
    },
  });

  const nature = await prisma.topic.create({
    data: {
      name: "Природа",
      description:
        "Материалы, связанные с животными, растениями, природными явлениями и ландшафтом.",
    },
  });

  const rituals = await prisma.topic.create({
    data: {
      name: "Обряды",
      description:
        "Материалы, связанные с традиционными действиями, праздниками и ритуалами.",
    },
  });

  const source = await prisma.source.create({
    data: {
      title: "Учебная подборка фольклорных материалов для MVP",
      author: "Загревская А.С.",
      year: 2026,
      type: "учебный материал",
      url: null,
    },
  });

  const material1 = await prisma.material.create({
    data: {
      title: "Легенда о духе тайги",
      shortDescription:
        "История о духе леса, который охраняет тайгу и помогает только уважительным людям.",
      fullText:
        "По старому преданию, в глубине тайги жил дух-хранитель. Он не показывался людям без причины, но наблюдал за каждым, кто входил в лес. Охотнику, который брал только необходимое и благодарил природу, дух помогал найти дорогу домой. Но того, кто ломал деревья без нужды и смеялся над лесными правилами, тайга могла долго водить кругами.",
      latitude: 50.2907,
      longitude: 127.5272,
      imageUrl: "/images/taiga-spirit.jpg",
      audioUrl: null,
      videoUrl: null,
      status: PublishStatus.PUBLISHED,
      regionId: amur.id,
      peopleId: evenki.id,
      genreId: legend.id,
      sourceId: source.id,
      createdById: admin.id,
      topics: {
        create: [
          {
            topicId: spirits.id,
          },
          {
            topicId: nature.id,
          },
        ],
      },
    },
  });

  const material2 = await prisma.material.create({
    data: {
      title: "Сказка о смелом охотнике",
      shortDescription:
        "Сказочный сюжет о юноше, который прошёл испытание и доказал свою смелость.",
      fullText:
        "Жил в стойбище молодой охотник. Однажды старшие отправили его в лес, чтобы он принёс знак своей смелости. По дороге он встретил говорящую птицу, которая предупредила его о трёх испытаниях. Юноша не испугался, помог раненому зверю, переправился через бурную реку и вернулся домой не с добычей, а с мудростью.",
      latitude: 62.0272,
      longitude: 129.7322,
      imageUrl: "/images/brave-hunter.jpg",
      audioUrl: null,
      videoUrl: null,
      status: PublishStatus.PUBLISHED,
      regionId: yakutia.id,
      peopleId: yakuts.id,
      genreId: fairyTale.id,
      sourceId: source.id,
      createdById: admin.id,
      topics: {
        create: [
          {
            topicId: nature.id,
          },
        ],
      },
    },
  });

  const material3 = await prisma.material.create({
    data: {
      title: "Миф о происхождении огня",
      shortDescription:
        "Мифологический рассказ о том, как люди получили огонь.",
      fullText:
        "В давние времена люди жили без огня и прятались от холода. Тогда маленькая птица решила помочь им. Она поднялась к огненному небу, схватила искру и принесла её людям. С тех пор огонь стали беречь, потому что он был не просто теплом, а даром, полученным через смелость и жертву.",
      latitude: 53.037,
      longitude: 158.6559,
      imageUrl: "/images/fire-myth.jpg",
      audioUrl: null,
      videoUrl: null,
      status: PublishStatus.PUBLISHED,
      regionId: kamchatka.id,
      peopleId: koryaks.id,
      genreId: myth.id,
      sourceId: source.id,
      createdById: admin.id,
      topics: {
        create: [
          {
            topicId: rituals.id,
          },
          {
            topicId: nature.id,
          },
        ],
      },
    },
  });

  await prisma.interactiveTask.create({
    data: {
      materialId: material1.id,
      title: "Проверь знание легенды",
      description:
        "Выбери правильный ответ по содержанию легенды о духе тайги.",
      type: "single_choice",
      difficulty: "easy",
      config: {
        question: "Кому дух тайги помогал найти дорогу домой?",
        options: [
          "Тому, кто громко шумел в лесу",
          "Тому, кто уважал природу",
          "Тому, кто рубил деревья",
          "Тому, кто охотился ради забавы",
        ],
        correctAnswer: "Тому, кто уважал природу",
        explanation:
          "В легенде дух помогает человеку, который бережно относится к лесу.",
      },
    },
  });

  await prisma.goal.create({
    data: {
      title: "Знаток легенд о духах",
      description:
        "Изучи материалы, связанные с духами природы, и выполни задания к ним.",
      requiredMaterialsCount: 1,
      cardTitle: "Хранитель тайги",
      cardImageUrl: "/images/cards/taiga-guardian.png",
      genreId: legend.id,
      topicId: spirits.id,
    },
  });

  console.log("Seed completed successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
