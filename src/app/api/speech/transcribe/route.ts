import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // Criar diretório temporário se não existir
    const tempDir = join(process.cwd(), 'tmp');
    try {
      await writeFile(join(tempDir, '.gitkeep'), '');
    } catch {
      // Diretório já existe
    }

    // Salvar arquivo de áudio
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    const audioPath = join(tempDir, `${Date.now()}.wav`);
    await writeFile(audioPath, buffer);

    // Executar Whisper para transcrição
    const { stdout, stderr } = await execAsync(
      `whisper "${audioPath}" --model base --output_format json --output_dir "${tempDir}"`
    );

    if (stderr) {
      console.error('Whisper error:', stderr);
    }

    // Ler resultado da transcrição
    const jsonPath = audioPath.replace('.wav', '.json');
    const result = require(jsonPath);

    // Limpar arquivos temporários
    await Promise.all([
      execAsync(`rm "${audioPath}"`),
      execAsync(`rm "${jsonPath}"`)
    ]);

    return NextResponse.json({
      text: result.text,
      segments: result.segments.map((segment: any) => ({
        text: segment.text,
        start: segment.start,
        end: segment.end,
        confidence: segment.confidence
      })),
      language: result.language
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
} 