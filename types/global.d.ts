declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string
      NEXTAUTH_URL: string
      NEXTAUTH_SECRET: string
      GOOGLE_CLIENT_ID?: string
      GOOGLE_CLIENT_SECRET?: string
      GITHUB_CLIENT_ID?: string
      GITHUB_CLIENT_SECRET?: string
      EMAIL_SERVER_HOST?: string
      EMAIL_SERVER_PORT?: string
      EMAIL_SERVER_USER?: string
      EMAIL_SERVER_PASSWORD?: string
      EMAIL_FROM?: string
      UPLOADTHING_SECRET?: string
      UPLOADTHING_APP_ID?: string
      GOOGLE_ANALYTICS_ID?: string
    }
  }
}

export {}


