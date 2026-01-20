import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';
import scriptData from './video-script.json';
import './style.css'; // Optional styling

export const RemotionRoot: React.FC = () => {
    // Default to 60s (1800 frames) if metadata missing, but use script data if available
    const durationInSeconds = scriptData?.metadata?.total_duration || 60;
    const fps = 30;

    return (
        <>
            <Composition
                id="MyVideo"
                component={MyVideo}
                durationInFrames={Math.ceil(durationInSeconds * fps)}
                fps={fps}
                width={1080}
                height={1920}
            />
        </>
    );
};
