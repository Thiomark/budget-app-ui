import {createContext, useEffect, useState} from 'react';
import { groupItems, url } from '../utils/helperFunctions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInterceptor from '../utils/axiosInterceptor';

export const DeductionContext = createContext();

export const DeductionProvider = ({children}) => {
    const [fetchedDeductions, setFetchedDeductions] = useState([]);
    const [allDeductions, setAllDeductions] = useState([]);
    const [deductions, setDeductions] = useState([]);
    const [deduction, setDeduction] = useState(null);
    const [image, setImage] = useState(null);

    useEffect(() => {
        const data = groupItems(fetchedDeductions, 'created_on');
        setDeductions(data);
    }, [fetchedDeductions]);

    // useEffect(() => {
    //     const newAllDeductions = [new Set(...data, ...allDeductions)]
    //     await AsyncStorage.setItem('allDeductions', JSON.stringify(newAllDeductions))
    //     setAllDeductions(newAllDeductions);
    // }, [])

    const fetchDeductions = async (id) => {
        try {
            const {data} = await axiosInterceptor.get(`${url}/deductions/${id}`);
            setFetchedDeductions(data);
        } catch (error) {

        }
    }

    const fetchDeduction = (id) => {
        const [deduction] = fetchedDeductions.filter(x => x.id === id);
        setDeduction(deduction);
    }

    const removeDeductions = () => {
        setFetchedDeductions([]);
    }

    const removeDeduction = () => {
        setDeduction(null);
    }

    const uploadImage = async (id, image) => {
        try {
            const imageName = `${Date.now()}-proof.jpg`;
            const formData = new FormData();
            formData.append('photo', { uri: image.image, name: imageName, type: 'image/jpg' });

            await fetch(`${url}/deductions/image`, {
                method: 'POST',
                body: formData,
                headers: {
                    'content-type': 'multipart/form-data',
                },
            });

            await axiosInterceptor.post(`${url}/deductions/${id}`, {
                image: imageName
            });
        } catch (error) {
            
        }
    }

    const addDeduction = async (amount, budgetID) => {
        let imageName = null;
        // if(amount.image){
        //     imageName = `${Date.now()}-proof.jpg`;
        //     const formData = new FormData();
        //     formData.append('photo', { uri: amount.image, name: imageName, type: 'image/jpg' });

        //     await fetch(`${url}/deductions/image`, {
        //         method: 'POST',
        //         body: formData,
        //         headers: {
        //             'content-type': 'multipart/form-data',
        //         },
        //     });
        // }

        try {
            const res = await axiosInterceptor.post(`${url}/deductions/${budgetID}`, {
                image: imageName,
                description: amount.description,
                tags: amount.tags,
                amount: -amount.amount,
                created_on: amount.created_on
            });

            setFetchedDeductions(pevDe => [res.data, ...pevDe]);
        } catch (error) {
            console.log(error.message)
        }

        setImage(null)
    }

    const deleteDeduction = async (budgetID, id) => {
        try {
            await axiosInterceptor.delete(`${url}/deductions/${budgetID}/${id}`);
            setFetchedDeductions(pevBg => pevBg.filter(x => x.id !== id));
        } catch (error) {
            
        }
    }

    return (
        <DeductionContext.Provider value={{fetchDeductions, addDeduction, removeDeductions, removeDeduction, deleteDeduction, fetchDeduction, fetchedDeductions, deductions, image, setImage}}>
            {children}
        </DeductionContext.Provider>
    )
}
