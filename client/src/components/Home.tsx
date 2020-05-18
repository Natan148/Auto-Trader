/* eslint-disable @typescript-eslint/camelcase */
import React, { useState, useEffect } from 'react';
import { Redirect, withRouter, RouteComponentProps } from 'react-router-dom';
import axios from 'axios';
import Pagination from '@material-ui/lab/Pagination';
import AutoNav from './layouts/AutoNav';
import Ad from './Ad';
import ListOfAds from './ListOfAds';
import { AdDetails } from './ad.interface';
import './home.css';

const Home: React.FunctionComponent<RouteComponentProps> = () => {
  const [listOfAds, setListOfAds] = useState<AdDetails[] | null>(null);
  const [numFound, setNumFound] = useState(0);
  const [numOfPages, setNumOfPages] = useState(0);
  const [startFetchAds, setStartFetchAds] = useState(0);

  const fetchAds = () => {
    console.log(startFetchAds)
    axios
      .get(
        `https://marketcheck-prod.apigee.net/v2/search/car/fsbo/active?api_key=IKzET2Un61MFR3DiI9RmucgyJAlcyhQv&rows=10&start=${startFetchAds}&facet_sort=count`
      )
      .then((response) => {
        console.log(response.data)
        setNumFound(response.data.num_found);
        // setNumOfPages(+response.data.num_found + 10);
        console.log(Math.floor(response.data.num_found/10))
        const listings = response.data.listings;
        const ads: AdDetails[] = [];
        listings.map((element: any) => {
          ads.push({
            id: element.id,
            make: element.build.make,
            price: element.price,
            model: element.build.model,
            year: element.build.year,
            transmission: element.build.transmission,
            engine: element.build.engine,
            engine_size: element.build.engine_size,
            fuel_type: element.build.fuel_type,
            dealerName: element.dealer.name,
            phon: '0999393939',
            inventory_type: element.inventory_type,
            miles: element.miles,
            first_seen_at: element.first_seen_at,
            first_seen_at_date: element.first_seen_at_date,
            last_seen_at: element.last_seen_at,
            last_seen_at_date: element.last_seen_at_date,
            photos: element.media.photo_links,
          });
        });
        setListOfAds(ads);
      });
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handelPages = (event: React.ChangeEvent<unknown>, value: number) => {
    setStartFetchAds((+value - 1) * 10);
    fetchAds();
  };

  return (
    <div className="home">
      <AutoNav />
      <div className="adsList">
        <h4>Found {numFound} ads</h4>
        <ListOfAds listOfAds={listOfAds} />
        <Pagination
          className="pagination"
          count={Math.floor(numFound/10)}
          variant="outlined"
          shape="rounded"
          onChange={handelPages}
        />
      </div>
    </div>
  );
};

export default withRouter(Home);
