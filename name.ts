import { OpenCC } from 'opencc'
import { PrismaClient } from '@prisma/client'
import { getShuliDesc } from './data'

const prisma = new PrismaClient()

async function str2int (name: string):Promise<number> {
  // if(isNumberic(name)) {
  //   return name + 0;
  // }

  return name.replace(/\s/g, '').split('').reduce(async function (sum: Promise<number>, c) {
    const codePoint = c.codePointAt(0)
    const kangxi = await findKangxi(codePoint)

    return kangxi
      ? (await sum) + kangxi.strokes
      : (await sum) + c.toLowerCase().charCodeAt(0) - 96
  }, Promise.resolve(0))
}

async function findKangxi (codePoint:number|undefined) {
  return await prisma.kangxi.findUnique({
    where: { value: codePoint }
  })
}

async function s2t (s: string):Promise<string> {
  const converter: OpenCC = new OpenCC('s2t.json')
  return await converter.convertPromise(s)
}

async function main () {
  const name = '玩偶'
  const tname = await s2t(name)
  const desc = getShuliDesc(await str2int(tname))

  console.log(tname + '\n')
  console.log(desc)
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
