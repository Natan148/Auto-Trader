/* eslint-disable @typescript-eslint/camelcase */
/* eslint react/prop-types: 0 */
import React, { useState, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import { AdDetails } from './ad.interface';
import Ad from './Ad';

interface Props {
  listOfAds: AdDetails[] | null;
}

const ListOfAds: React.FC<Props> = (props) => {
  const { listOfAds } = props;

  return (
    <div>
      {listOfAds ? null : (
        <div className="sweet-loading">
          <ClipLoader size={150} color={'#123abc'} loading={true} />
        </div>
      )}
      {listOfAds
        ? listOfAds.map((ad) => <Ad key={ad.id} details={ad} />)
        : null}
    </div>
  );
};

export default ListOfAds;
