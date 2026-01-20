import { AbsoluteFill, useCurrentFrame, interpolate, Audio, staticFile } from 'remotion';

export const MyVideo = () => {
    const frame = useCurrentFrame();
    const audio = staticFile("audio.mp3");

    const opacity = interpolate(frame, [0, 30], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const translateY = interpolate(frame, [0, 60], [20, 0], {
        extrapolateRight: 'clamp',
    });

    return (
        <AbsoluteFill style={{ backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' }}>
            <Audio src={audio} />
            <div
                style={{
                    fontFamily: '"Times New Roman", Times, serif',
                    color: 'white',
                    fontSize: '80px',
                    fontWeight: 'bold',
                    opacity,
                    transform: `translateY(${translateY}px)`,
                    textAlign: 'center',
                    lineHeight: 1.5,
                }}
            >
                <div style={{ fontSize: '40px', marginBottom: '20px', letterSpacing: '0.1em' }}>一流を、再定義する。</div>
                <div style={{ fontSize: '100px', letterSpacing: '0.05em' }}>Wealth Navigator</div>
            </div>
        </AbsoluteFill>
    );
};
