import process from 'process';

export default function isDev() {
    return process.env.NODE_ENV === 'development';
}
