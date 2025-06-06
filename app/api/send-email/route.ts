
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { pdfData, fileName, metadata } = await request.json();

    if (!pdfData) {
      return NextResponse.json(
        { error: 'PDF данните са задължителни' },
        { status: 400 }
      );
    }

    // Конфигуриране на SMTP transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: parseInt(process.env.SMTP_PORT || '587') === 465, // true за 465, false за други портове
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Проверка на SMTP връзката
    await transporter.verify();

    // Конвертиране на base64 към Buffer
    const pdfBuffer = Buffer.from(pdfData.split(',')[1], 'base64');

    // Генериране на име на файла с дата и час
    const now = new Date();
    const dateStr = now.toLocaleDateString('bg-BG');
    const timeStr = now.toLocaleTimeString('bg-BG');
    const finalFileName = fileName || `Сканиран_документ_${now.getTime()}.pdf`;

    // HTML темплейт за имейла
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
          .content { background: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px; }
          .footer { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-size: 12px; color: #666; }
          .highlight { color: #007bff; font-weight: bold; }
          .metadata { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📄 Нов сканиран документ</h2>
            <p>Автоматично изпратен от Document Scanner App</p>
          </div>
          
          <div class="content">
            <h3>Детайли за документа:</h3>
            <div class="metadata">
              <p><strong>📅 Дата на сканиране:</strong> <span class="highlight">${dateStr}</span></p>
              <p><strong>🕐 Час на сканиране:</strong> <span class="highlight">${timeStr}</span></p>
              <p><strong>📎 Име на файла:</strong> <span class="highlight">${finalFileName}</span></p>
              <p><strong>📏 Размер на файла:</strong> <span class="highlight">${(pdfBuffer.length / 1024).toFixed(2)} KB</span></p>
              ${metadata ? `<p><strong>ℹ️ Допълнителна информация:</strong> ${metadata}</p>` : ''}
            </div>
            
            <p>Моля, намерете прикачения PDF документ. Документът е автоматично обработен и оптимизиран за печат.</p>
            
            <p><strong>Забележка:</strong> Този имейл е изпратен автоматично от системата за сканиране на документи.</p>
          </div>
          
          <div class="footer">
            <p>🤖 Автоматично генериран имейл от Document Scanner App</p>
            <p>Дата и час на изпращане: ${now.toLocaleString('bg-BG')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Опции за имейла
    const mailOptions = {
      from: `"Document Scanner App" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: `📄 Нов сканиран документ - ${dateStr} ${timeStr}`,
      html: htmlTemplate,
      attachments: [
        {
          filename: finalFileName,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    // Изпращане на имейла
    const info = await transporter.sendMail(mailOptions);

    console.log('Имейлът е изпратен успешно:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Имейлът е изпратен успешно!',
      messageId: info.messageId,
      fileName: finalFileName,
      fileSize: `${(pdfBuffer.length / 1024).toFixed(2)} KB`,
    });

  } catch (error) {
    console.error('Грешка при изпращане на имейл:', error);
    
    let errorMessage = 'Възникна грешка при изпращане на имейла';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login')) {
        errorMessage = 'Грешка в SMTP автентикацията. Моля, проверете имейл данните.';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Не може да се свърже със SMTP сървъра. Проверете мрежовата връзка.';
      } else {
        errorMessage = `Грешка: ${error.message}`;
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Неизвестна грешка'
      },
      { status: 500 }
    );
  }
}
