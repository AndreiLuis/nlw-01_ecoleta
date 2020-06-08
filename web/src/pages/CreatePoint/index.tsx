import React, {useEffect, useState, ChangeEvent, ChangeEventHandler, FormEvent} from 'react';
import {FiArrowDownLeft} from 'react-icons/fi';
import {Link, useHistory} from 'react-router-dom';
import {Map, TileLayer, Marker} from 'react-leaflet';
import {LeafletMouseEvent} from 'leaflet';
import api from '../../services/api';
import state from '../../services/state'
import municipios from '../../services/municipios'

import Dropzone from '../../components/dropzone';

import logo from '../../assets/logo.svg';
import './styles.css';

interface Item{
    id: number;
    title: string;
    image_url: string;
}

interface State{
    sigla: string;
}

interface Cidade{
    nome: string;
}

const CreatePoint = () =>{

    const [items, setItems] = useState<Item[]>([]);
    const [states ,setInitialsState] = useState<State[]>([]);
    const [cidades, setMunicipios] = useState<Cidade[]>([]);

    const [selectedUF, setSelectedUF] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');

    const [selectedFile, setSelectedFile] = useState<File>();
    const [inputData, setInputData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    })

    const history = useHistory();
    const [initialPositionMap, setInitialPositionMap] = useState<[number, number]>([0,0]);
    const [selectedPositionMap, setSelectedPositionMap] = useState<[number, number]>([0,0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    useEffect(()=>{
        navigator.geolocation.getCurrentPosition(position =>{
            const {latitude, longitude} = position.coords;
                setInitialPositionMap([latitude, longitude]);
        },
        error =>{
            setInitialPositionMap([-21.1959747,-47.7962389]);
        });
    }, []);

    useEffect(()=>{
        api.get('items').then(response => {
            setItems(response.data)
        });
    }, []);

    useEffect(() =>{
        state.get('estados').then(response =>{
            setInitialsState(response.data);
        });
    }, []);

    useEffect(() =>{
        if(selectedUF === '0')
            return;
        municipios.get(`${selectedUF}/municipios`).then(response =>{
            setMunicipios(response.data);
        });
            //{UF}/municipios
    }, [selectedUF]);

    function handleSelectUF(event: ChangeEvent<HTMLSelectElement>){
        const uf = event.target.value;
        setSelectedUF(uf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
        setSelectedCity(city);
    }

    function handleMapClick(event: LeafletMouseEvent){
        setSelectedPositionMap([event.latlng.lat, event.latlng.lng,]);
    }

    function handleIpuntChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target;
        setInputData({...inputData, [name]:value});
    }

    function handleSelectItem(id: number){
        console.log(id)
        const alreadySelected = selectedItems.findIndex(item => item === id);
        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        }else{
            setSelectedItems([...selectedItems, id]);
        }
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault();
        const {name, email, whatsapp} = inputData;
        const uf = selectedUF;
        const city = selectedCity;
        const [latitude, longitude] = selectedPositionMap;
        const items = selectedItems;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));
        
        if (selectedFile) {
          data.append('image', selectedFile);
        }
        
        await api.post('points', data);

        alert('Ponto de coleta criado!');

        history.push('/');

    }

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>

                <Link to="/">
                    <FiArrowDownLeft/>
                    Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />
                
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da Entidade</label>
                        <input type="text"
                        name="name"
                        id="name"
                        onChange={handleIpuntChange}
                        />
                    </div>
                    
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input type="text"
                            name="email"
                            id="email"
                            onChange={handleIpuntChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input type="text"
                            name="whatsapp"
                            id="whatsapp"
                            onChange={handleIpuntChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPositionMap} zoom={15} onclick={handleMapClick}>
                        <TileLayer
                         attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPositionMap} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" value={selectedUF} onChange={handleSelectUF}>
                                <option value="0">Selecione uma UF</option>
                                {states.map(uf => (
                                    <option key={uf.sigla} value={uf.sigla}>{uf.sigla}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" value={selectedCity} id="city" onChange={handleSelectCity}>
                                <option value="0">Selecione uma Cidade</option>
                                {cidades.map(city => (
                                    <option key={city.nome} value={city.nome}>{city.nome}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id} 
                            onClick={() => handleSelectItem(item.id)}
                            className={selectedItems.includes(item.id) ? 'selected' : ''}>
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>  
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
};

export default CreatePoint;