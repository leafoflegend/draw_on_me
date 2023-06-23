const getArt = async () => {
    try {
        const response = await fetch('http://localhost:6969/art');
        const json = await response.json();

        if (!json.success) {
            throw new Error(json.error);
        }

        return json.art;
    } catch (e) {
        console.log('Failed to fetch art.');
        console.error(e);
    }
};

export default getArt;
