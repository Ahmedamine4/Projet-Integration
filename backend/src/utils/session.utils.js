import { UAParser } from 'ua-parser-js';
import geoip from 'geoip-lite';

export const parseSessionInfo = (req) => {

  const ua = new UAParser(req.headers);

  const browser = ua.getBrowser().name ?? 'Inconnu';
  const browser_version = ua.getBrowser().version ?? "Inconnu";

  const osName = ua.getOS().name ?? 'Inconnu';
  const osVersion = ua.getOS().version ?? "";
  const os = `${osName} ${osVersion}`.trim();
  
  const device_type = ua.getDevice().type ?? "desktop";

  const ip = (
    req.headers['x-forwarded-for'] ??
    req.socket.remoteAddress ??
    ''
  ).split(',')[0].trim();


  const geo = geoip.lookup(ip);
  const ville = geo?.city ?? 'Inconnu';
  const pays = geo?.country ?? 'Inconnu';

  return { browser, device_type, os, browser_version, ip, ville, pays };
};