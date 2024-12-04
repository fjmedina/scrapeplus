import { TwitterService } from './twitter';
import { FacebookService } from './facebook';
import { LinkedInService } from './linkedin';
import { InstagramService } from './instagram';

export const socialServices = {
  twitter: new TwitterService(),
  facebook: new FacebookService(),
  linkedin: new LinkedInService(),
  instagram: new InstagramService(),
};

export type SocialPlatform = keyof typeof socialServices;