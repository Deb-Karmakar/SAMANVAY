class UploadService {
    getUploadUrl(protocol, host, filename) {
        return `${protocol}://${host}/uploads/${filename}`;
    }
}

export default new UploadService();
