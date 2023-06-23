const getArt = async () => {
    try {
        // TODO: Move to detect environment.
        const response = await fetch(`https://${window.location.host}/art`);
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
