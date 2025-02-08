
const prisma = new PrismaClient();

async function main() {
    const alunos = await prisma.aluno.findMany();
    console.log('Alunos:', alunos);
}

main()
    .catch((e) => {
        console.error('Erro ao conectar ao banco:', e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
