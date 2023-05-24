import { IonSelect, IonSelectOption, IonBadge, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonNote, IonPage, IonRow, IonSearchbar, IonTitle, IonToolbar } from "@ionic/react";
import { cart, chevronBackOutline, searchOutline, heart } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router"
import ProductCard from "../components/ProductCard";

import { CartStore } from "../data/CartStore";
import { ProductStore } from "../data/ProductStore";

//Added
import { FavouritesStore } from '../data/FavouritesStore';

import styles from "./CategoryProducts.module.css";



const CategoryProducts = () => {

    const params = useParams();
    const cartRef = useRef();
    const products = ProductStore.useState(s => s.products);
    const shopCart = CartStore.useState(s => s.product_ids);
    // Added
    const favourites = FavouritesStore.useState(s => s.product_ids);

    const [ category, setCategory ] = useState({});
    const [ searchResults, setsearchResults ] = useState([]);
    const [ amountLoaded, setAmountLoaded ] = useState(6);

    // New state variable 'sortOrder' added. It will hold the current sorting order of the products
    const [ sortOrder, setSortOrder ] = useState('Low to High');

    // New function 'sortProducts'. It sorts an array of products based on a given sorting order
    const sortProducts = (products, order) => {
        return [...products].sort((a, b) => {
            if (order === 'Low to High') {
                return parseFloat(a.price.replace("£", "")) - parseFloat(b.price.replace("£", ""));
            } else if (order === 'High to Low') {
                return parseFloat(b.price.replace("£", "")) - parseFloat(a.price.replace("£", ""));
            } else if (order === 'A to Z') {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });
    };

    useEffect(() => {

        const categorySlug = params.slug;
        const tempCategory = products.filter(p => p.slug === categorySlug)[0];
        // Usage of the new 'sortProducts' function
        const sortedProducts = sortProducts(tempCategory.products, sortOrder);

        setCategory(tempCategory);
        setsearchResults(sortedProducts);
    // New dependencies 'sortOrder' and 'products' added to the dependency array
    }, [ params.slug, sortOrder, products ]);

    // New function 'handleSortOrderChange'. It updates the 'sortOrder' state when the sort order is changed
    const handleSortOrderChange = (e) => {
        setSortOrder(e.target.value);
    }

    const fetchMore = async (e) => {
		//	Increment the amount loaded by 6 for the next iteration
		setAmountLoaded(prevAmount => (prevAmount + 6));
		e.target.complete();
	}

    const search = async e => {
        //added . repllace to remove spaces
        const searchVal = e.target.value.replace(/\s/g, '');

        if (searchVal !== "") {
            // Added .Replace to remove spaces
            const tempResults = category.products.filter(p => p.name.replace(/\s/g, '').toLowerCase().includes(searchVal.toLowerCase()));
            // Usage of the new 'sortProducts' function
            setsearchResults(sortProducts(tempResults, sortOrder));
        } else {
            // Usage of the new 'sortProducts' function
            setsearchResults(sortProducts(category.products, sortOrder));
        }
    }

    return (

        <IonPage id="category-page" className={ styles.categoryPage }>
            <IonHeader>
				<IonToolbar>
                    <IonButtons slot="start">
                        <IonButton color="dark" text={ category.name } routerLink="/" routerDirection="back">
                            <IonIcon color="dark" icon={ chevronBackOutline } />&nbsp;Categories
                        </IonButton>
                    </IonButtons>
					<IonTitle>{ category && category.name }</IonTitle>

                    <IonButtons slot="end">
                        {/* Added */}
                        <IonBadge color="danger">
                            { favourites.length }
                        </IonBadge>
						<IonButton color="danger" routerLink="/favourites">
							<IonIcon icon={ heart } />
						</IonButton>


                        <IonBadge color="dark">
                            { shopCart.length }
                        </IonBadge>
						<IonButton color="dark" routerLink="/cart">
							<IonIcon ref={ cartRef } className="animate__animated" icon={ cart } />
						</IonButton>
					</IonButtons>
				</IonToolbar>
			</IonHeader>
			
			<IonContent fullscreen>

                <IonSearchbar className={ styles.search } onKeyUp={ search } placeholder="Try 'high back'" searchIcon={ searchOutline } animated={ true } />

                {/* New 'IonSelect' component. It lets the user select a sorting order for the products */}
                <IonSelect value={sortOrder} placeholder="Sort By" onIonChange={handleSortOrderChange}>
                    <IonSelectOption value='Low to High'>Price Low to High</IonSelectOption>
                    <IonSelectOption value='High to Low'>Price High to Low</IonSelectOption>
                    <IonSelectOption value='A to Z'>Product Name A to Z</IonSelectOption>
                    <IonSelectOption value='Z to A'>Product Name Z to A</IonSelectOption>
                </IonSelect>

                <IonGrid>

                    <IonRow className="ion-text-center">
                        <IonCol size="12">
                            <IonNote>{ searchResults && searchResults.length } { (searchResults.length > 1 || searchResults.length === 0) ? " products" : " product" } found</IonNote>
                        </IonCol>
                    </IonRow>

                    <IonRow>
                        { searchResults && searchResults.map((product, index) => {

                            if ((index <= amountLoaded) && product.image) {
                                return (
                                    <ProductCard key={ `category_product_${ index }`} product={ product } index={ index } cartRef={ cartRef } category={ category } />
                                );
                            }
                        })}
                    </IonRow>
                </IonGrid>

                <IonInfiniteScroll threshold="100px" onIonInfinite={ fetchMore }>
					<IonInfiniteScrollContent loadingSpinner="bubbles" loadingText="Fetching more...">
					</IonInfiniteScrollContent>
				</IonInfiniteScroll>
            </IonContent>
        </IonPage>
    );
}

export default CategoryProducts;