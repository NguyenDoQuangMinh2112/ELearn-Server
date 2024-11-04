### 1. Thêm TypeScript như một dev dependency:

```bash
npm install typescript --save-dev
```

### 2. Cài đặt kiểu dữ liệu TypeScript cho Node.js:

```bash
npm install @types/node --save-dev
```

### 3. Cài đặt các package config cần thiết:

```bash
npm install eslint prettier eslint-config-prettier eslint-plugin-prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser ts-node tsc-alias tsconfig-paths rimraf nodemon --save-dev
```

- eslint: Linter (bộ kiểm tra lỗi) chính
- prettier: Code formatter chính
- eslint-config-prettier: Cấu hình ESLint để không bị xung đột với Prettier
- eslint-plugin-prettier: Dùng thêm một số rule prettier cho eslint
- @typescript-eslint/eslint-plugin: ESLint plugin cung cấp các rule cho Typescript
- @typescript-eslint/parser: Parser cho phép ESLint kiểm tra lỗi Typescript
- ts-node: Dùng để chạy TypeScript code trực tiếp mà không cần build
- tsc-alias: Xử lý alias khi build
- tsconfig-paths: Khi setting alias import trong dự án dùng ts-node thì chúng ta cần dùng tsconfig-paths để nó + hiểu được paths và baseUrl trong file tsconfig.json
- rimraf: Dùng để xóa folder dist khi trước khi build
- nodemon: Dùng để tự động restart server khi có sự thay đổi trong code

### 4. Cấu hình file 'tsconfig.json'

Thêm nội dung sau vào file `tsconfig.json` để cấu hình TypeScript:

```json
{
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "Node",
    "target": "ES2022",
    "outDir": "dist",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "baseUrl": "./",
    "paths": {
      "~/*": ["src/*"]
    }
  },
  "ts-node": {
    "require": ["tsconfig-paths/register"]
  },
  "files": ["src/type.d.ts"],
  "include": ["src/**/*"]
}
```

### 5. Cấu hình file config cho ESLint

Tạo file `.eslintrc` tại thư mục root, copy và paste config dưới đây vào file `.eslintrc`

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint", "prettier"],
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "eslint-config-prettier", "prettier"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "prettier/prettier": [
      "warn",
      {
        "arrowParens": "always",
        "semi": false,
        "trailingComma": "none",
        "tabWidth": 2,
        "endOfLine": "auto",
        "useTabs": false,
        "singleQuote": true,
        "printWidth": 120,
        "jsxSingleQuote": true
      }
    ]
  }
}
```

### 6.Tiếp theo tạo file .eslintignore để ignore các file không cần kiểm tra lỗi

```
node_modules/
dist/
```

### 7.Cấu hình file config cho Prettier

Tạo file `.prettierrc` trong thư trong thư mục root với nội dung dưới đây

```json
{
  "arrowParens": "always",
  "semi": false,
  "trailingComma": "none",
  "tabWidth": 2,
  "endOfLine": "auto",
  "useTabs": false,
  "singleQuote": true,
  "printWidth": 120,
  "jsxSingleQuote": true
}

Tiếp theo Tạo file `.prettierignore` ở thư mục root
```

### 8. Cấu hình file gitignore

Tạo file ` .gitignore` ở thư mục root

```
node_modules/
dist/
```
