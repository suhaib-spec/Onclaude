import { BadRequestException, Controller, Get, Header, Query, ServiceUnavailableException, StreamableFile } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

/**
 * Human-sounding text-to-speech for Ava (T-021). Uses Microsoft's neural voices through the msedge-tts package
 * (no API key). The frontend falls back to the browser's own voice if this endpoint fails.
 */
const ALLOWED = new Set(['en-US-AvaMultilingualNeural', 'en-US-AvaNeural', 'en-US-JennyNeural', 'en-US-EmmaMultilingualNeural', 'en-US-AndrewMultilingualNeural', 'en-US-BrianMultilingualNeural', 'en-US-AriaNeural', 'en-GB-SoniaNeural']);
const cache = new Map<string, Buffer>();

@Controller('tts')
export class TtsController {
  @Get()
  @Header('Content-Type', 'audio/mpeg')
  @Header('Cache-Control', 'public, max-age=86400')
  async speak(@Query('text') text = '', @Query('voice') voice = 'en-US-AvaMultilingualNeural'): Promise<StreamableFile> {
    const clean = String(text).replace(/\s+/g, ' ').trim().slice(0, 1200);
    if (!clean) throw new BadRequestException('text is required');
    const v = ALLOWED.has(voice) ? voice : 'en-US-AvaMultilingualNeural';
    const key = `${v}|${clean}`;
    let buf = cache.get(key);
    if (!buf) {
      buf = await this.synthesize(clean, v);
      if (cache.size > 300) cache.clear();
      cache.set(key, buf);
    }
    return new StreamableFile(buf);
  }

  private async synthesize(text: string, voice: string): Promise<Buffer> {
    const tts = new MsEdgeTTS();
    try {
      await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
      const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const { audioStream } = tts.toStream(escaped);
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error('TTS timeout')), 15000);
        audioStream.on('data', (c: Buffer) => chunks.push(Buffer.from(c)));
        audioStream.on('end', () => { clearTimeout(t); resolve(); });
        audioStream.on('close', () => { clearTimeout(t); resolve(); });
        audioStream.on('error', (e: Error) => { clearTimeout(t); reject(e); });
      });
      const out = Buffer.concat(chunks);
      if (!out.length) throw new Error('empty audio');
      return out;
    } catch (e: any) {
      throw new ServiceUnavailableException(`Neural voice unavailable: ${e?.message ?? e}`);
    } finally {
      try { tts.close(); } catch { /* ignore */ }
    }
  }
}
