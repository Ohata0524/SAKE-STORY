import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // テスト環境で Next.js のアプリを読み込むためのパス
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  // テスト実行前に読み込むセットアップファイルを指定
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // ブラウザ環境（DOM）をシミュレートする設定
  testEnvironment: 'jest-environment-jsdom',
  // モジュールパスの解決（@/ などを理解させる）
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

export default createJestConfig(config)
