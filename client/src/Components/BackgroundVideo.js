import React, { useEffect, useState } from 'react';
import './BackgroundVideo.css';


const videos = [
    "https://cdn.pixabay.com/video/2023/08/04/174590-851804342_large.mp4",
    "https://cdn.pixabay.com/video/2023/06/18/167688-837428971_large.mp4",
    "https://cdn.pixabay.com/video/2022/01/24/105540-670917718_large.mp4",
    "https://cdn.pixabay.com/video/2022/04/30/115570-705567490_large.mp4",
    "https://cdn.pixabay.com/video/2020/01/28/31664-387972279_large.mp4"
];


const getRandomIndex = (currentIndex) => {
    let newIndex = Math.floor(Math.random() * videos.length);
    while (newIndex === currentIndex) {
        newIndex = Math.floor(Math.random() * videos.length);
    }
    return newIndex;
};

const BackgroundVideo = () => {
    const [currentVideo, setCurrentVideo] = useState(0);
    const [transitioning, setTransitioning] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTransitioning(true);
            setTimeout(() => {
                setCurrentVideo((prevVideo) => getRandomIndex(prevVideo));
                setTransitioning(false);
            }, 1500);
        }, 60000);

        return () => clearInterval(interval);
    }, []);


    return (
        <div className={`background-video-container ${transitioning ? 'transitioning' : ''}`}>
            <video
                className={`background-video ${transitioning ? 'fade-out' : 'fade-in'}`}
                src={videos[currentVideo]}
                autoPlay
                muted
                loop
            />
        </div>
    );
};

export default BackgroundVideo;
