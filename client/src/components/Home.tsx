/* eslint-disable @typescript-eslint/camelcase */
import React, { useState } from 'react';
import { Redirect, withRouter, RouteComponentProps } from 'react-router-dom';
import AutoNav from './layouts/AutoNav';
import Ad from './Ad';
import { AdDetails } from './ad.interface';

const car: AdDetails = {
  id: '1GTHK29U44E106331-140827c9-f12f',
  make: 'GMC',
  price: '12,000',
  model: 'Sierra 2500H',
  year: '2004',
  transmission: 'manual',
  engine: '6L V8',
  engine_size: '6',
  fuel_type: 'Disel',
  dealerName: 'natan',
  phon: '0999393939',
  inventory_type: 'used',
  miles: '120,000',
  first_seen_at: 1589213306,
  first_seen_at_date: '2020-05-11T16:08:26.000Z',
  last_seen_at: 1589687518,
  last_seen_at_date: '2020-05-17T03:51:58.000Z',
  photos: [
    'https://img.ksl.com/mx/mplace-cars.ksl.com/3707586-1588970595-680125.jpeg',
    'https://img.ksl.com/mx/mplace-cars.ksl.com/3707586-1588970596-303607.jpeg',
    'https://img.ksl.com/mx/mplace-cars.ksl.com/3707586-1588970633-497167.jpeg',
    'https://img.ksl.com/mx/mplace-cars.ksl.com/3707586-1588970739-94715.jpeg',
    'https://img.ksl.com/mx/mplace-cars.ksl.com/3707586-1588970796-549792.jpeg',
    'https://img.ksl.com/mx/mplace-cars.ksl.com/3707586-1588970885-214371.jpeg',
    'https://img.ksl.com/mx/mplace-cars.ksl.com/3707586-1588970887-553167.jpeg',
    'https://img.ksl.com/mx/mplace-cars.ksl.com/3707586-1588970920-937511.jpeg',
    'https://img.ksl.com/mx/mplace-cars.ksl.com/3707586-1588970920-13476.jpeg',
    'https://img.ksl.com/mx/mplace-cars.ksl.com/3707586-1588970987-696131.jpeg',
    'https://img.ksl.com/mx/mplace-cars.ksl.com/3707586-1588970985-606908.jpeg',
    'https://img.ksl.com/mx/mplace-cars.ksl.com/3707586-1588971012-54277.jpeg',
    'https://img.ksl.com/mx/mplace-cars.ksl.com/3707586-1588971009-686010.jpeg',
  ],
};

const Home: React.FunctionComponent<RouteComponentProps> = () => {
  return (
    <div className="home">
      <AutoNav />
      <h2>Found {4} ads</h2>
      <Ad details={car} />
    </div>
  );
};

export default withRouter(Home);
