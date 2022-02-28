import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";

import useSWR from "swr";

import cls from "classnames";

import { fetchCoffeeStores } from "../../lib/coffee-stores";

import styles from "../../styles/coffee-store.module.css";
import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../store/store-context";
import { fetcher, isEmpty } from "../../utils";

export async function getStaticProps({ params }) {
  const coffeeStores = await fetchCoffeeStores();
  const findCoffeeStoreById = coffeeStores.find((coffeeStore) => {
    return coffeeStore.id.toString() === params.id; //dynamic id
  });
  return {
    props: {
      coffeeStore: findCoffeeStoreById ? findCoffeeStoreById : {},
    },
  };
}

export async function getStaticPaths() {
  const coffeeStores = await fetchCoffeeStores();
  const paths = coffeeStores.map((coffeeStore) => {
    return {
      params: {
        id: coffeeStore.id.toString(),
      },
    };
  });
  return {
    paths,
    fallback: true,
  };
}

const CoffeeStore = (initialProps) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const id = router.query.id;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [coffeeStoreState, userCoffeeStoresState] = useState(
    initialProps.coffeeStore
  );

  const {
    state: { coffeeStores },
    // eslint-disable-next-line react-hooks/rules-of-hooks
  } = useContext(StoreContext);

  const handleCreateCoffeeStore = async (coffeeStore) => {
    try {
      const { id, name, address, neighbourhood, imgUrl } = coffeeStore;
      const response = await fetch("/api/createCoffeeStore", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          name,
          voting: 0,
          imgUrl,
          neighbourhood: neighbourhood || "",
          address: address || "",
        }),
      });

      const dbCoffeeStores = await response.json();
    } catch (error) {
      console.error(error);
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (isEmpty(initialProps.coffeeStore)) {
      if (coffeeStores.length > 0) {
        const coffeeStoreFromContext = coffeeStores.find((coffeeStore) => {
          return coffeeStore.id.toString() === id; //dynamic id
        });
        if (coffeeStoreFromContext) {
          userCoffeeStoresState(coffeeStoreFromContext);
          handleCreateCoffeeStore(coffeeStoreFromContext);
        }
      }
    } else {
      //SSG
      handleCreateCoffeeStore(initialProps.coffeeStore);
    }
  }, [id, initialProps, initialProps.coffeeStore]);

  const { name, address, imgUrl, neighbourhood } = coffeeStoreState;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [votingCount, setVotingCount] = useState(0);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data, error } = useSWR(`/api/getCoffeeStoreById?id=${id}`, fetcher);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (data && data.length > 0) {
      setVotingCount(data[0].voting);
    }
  }, [data]);

  const handleUpvoteButton = async () => {
    try {
      const response = await fetch("/api/favouriteCoffeeStoreById", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      });

      const dbCoffeeStores = await response.json();

      if (dbCoffeeStores && dbCoffeeStores.length > 0) {
        let count = votingCount + 1;
        setVotingCount(count);
      }
    } catch (error) {
      console.error("Error up-voting the coffee Store!", error);
    }
  };

  return (
    <div className={styles.layout}>
      <Head>
        <title>{name}</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.col1}>
          <div className={styles.backToHomeLink}>
            <Link href="/">
              <a>← Back to Home</a>
            </Link>
          </div>
          <div className={styles.nameWrapper}>
            <h1 className={styles.name}>{name}</h1>
          </div>
          <div className={styles.storeImgWrapper}>
            <Image
              src={
                imgUrl ||
                "https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80"
              }
              alt={name}
              width={600}
              height={360}
              className={styles.storeImg}
            />
          </div>
        </div>
        <div className={cls("glass", styles.col2)}>
          <div className={styles.iconWrapper}>
            <Image
              src="/static/icons/places.svg"
              alt="places"
              width={24}
              height={24}
            />
            <p className={styles.text}>{address}</p>
          </div>
          {neighbourhood && (
            <div className={styles.iconWrapper}>
              <Image
                src="/static/icons/nearMe.svg"
                alt="near-me"
                width={24}
                height={24}
              />
              <p className={styles.text}>{neighbourhood}</p>
            </div>
          )}
          <div className={styles.iconWrapper}>
            <Image
              src="/static/icons/star.svg"
              alt="star"
              width={24}
              height={24}
            />
            <p className={styles.text}>{votingCount}</p>
          </div>
          <button className={styles.upvoteButton} onClick={handleUpvoteButton}>
            Up Vote!
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoffeeStore;
