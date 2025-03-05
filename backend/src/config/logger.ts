import morgan from 'morgan';
import chalk from 'chalk';
import type { Request } from 'express';

// Custom format for simplified logging with colors
const format = ':date[iso] | :method | :url | :status | :response-time ms';

// Create logger middleware
export const logger = morgan(format, {
    skip: (req: Request) => {
        // Skip logging for static files and health checks
        return req.url.includes('.') || req.url === '/health';
    },
    stream: {
        write: (message: string) => {
            const [timestamp, method, url, status, responseTime] = message.trim().split(' | ');

            // Format timestamp to be more readable
            const formattedTime = new Date(timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });

            // Color the status code based on its value
            const statusColor = (status: string) => {
                const code = parseInt(status);
                if (code >= 500) return chalk.red(status);
                if (code >= 400) return chalk.yellow(status);
                if (code >= 300) return chalk.cyan(status);
                return chalk.green(status);
            };

            // Color the HTTP method
            const methodColor = (method: string) => {
                switch (method) {
                    case 'GET': return chalk.blue(method.padEnd(5));
                    case 'POST': return chalk.green(method.padEnd(5));
                    case 'PUT': return chalk.yellow(method.padEnd(5));
                    case 'DELETE': return chalk.red(method.padEnd(5));
                    default: return chalk.white(method.padEnd(5));
                }
            };

            // Color the response time based on duration
            const responseTimeColor = (time: string) => {
                const ms = parseFloat(time);
                if (ms > 1000) return chalk.red(time);
                if (ms > 500) return chalk.yellow(time);
                return chalk.green(time);
            };

            // Format the URL to be more readable
            const formattedUrl = url.length > 30
                ? url.substring(0, 30) + '...'
                : url.padEnd(33);

            // Format the log message with colors and better spacing
            const coloredMessage = [
                chalk.gray(`[${formattedTime}]`),
                methodColor(method),
                chalk.white(formattedUrl),
                statusColor(status.padStart(3)),
                responseTimeColor(responseTime)
            ].join(' | ');

            console.log(coloredMessage);
        }
    }
}); 