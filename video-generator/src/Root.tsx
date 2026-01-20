import { Composition } from 'remotion';
import { MyVideo } from './MyVideo';
import './style.css'; // Optional styling

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="MyVideo"
                component={MyVideo}
                durationInFrames={150} // 5 sec * 30 fps
                fps={30}
                width={1920}
                height={1080}
            />
        </>
    );
};
