import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { env } from '~/configs/evironment'

const CLIENT_ID = env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET
const REDIRECT_URL = env.REDIRECT_URL

const getAuthUrl = (): string => {
  const scopes = ['https://www.googleapis.com/auth/youtube.upload']
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  })
}

const oauth2Client: OAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)

export { oauth2Client, getAuthUrl }
