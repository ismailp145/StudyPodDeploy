import { View } from 'react-native'
import PodcastPlayer from '@/src/components/PodcastPlayer'

import React from "react";

const audioURL = 'https://team5-study-pod-s3-bucket.s3.us-east-2.amazonaws.com/uploads/audio-0ed7df8d-dbae-44c4-a71a-9dee9c1a780c.mp3' 
// const title = 'React Fundamentals: Building Modern UIs with Components and Virtual DOM'
const Player = () => {

  return (
    <View>
        <PodcastPlayer s3Url={audioURL} />
    </View>
  );
};

export default Player;
