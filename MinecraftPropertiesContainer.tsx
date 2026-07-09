import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import http from '@/api/http';
import Spinner from '@/components/elements/Spinner';

interface ServerProperties {
    [key: string]: string;
}

export default () => {
    const server = ServerContext.useStoreState((state) => state.server.data);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [properties, setProperties] = useState<ServerProperties>({});
    
    // Estados para validaciones individuales
    const [maxPlayersStr, setMaxPlayersStr] = useState<string>('20');
    const [playersError, setPlayersError] = useState<string>('');

    // Ruta del archivo en el servidor proxy de archivos de Pterodactyl
    const filePath = '/server.properties';

    useEffect(() => {
        if (!server) return;

        // Leer el archivo server.properties desde la API de Pterodactyl
        http.get(`/api/client/servers/${server.uuid}/files/contents`, { params: { file: filePath } })
            .then(({ data }) => {
                const props: ServerProperties = {};
                const lines = data.split('\n');
                
                lines.forEach((line: string) => {
                    const trimmed = line.trim();
                    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
                        const [key, ...valueParts] = trimmed.split('=');
                        props[key.trim()] = valueParts.join('=').trim();
                    }
                });

                setProperties(props);
                if (props['max-players']) {
                    setMaxPlayersStr(props['max-players']);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error al cargar server.properties:', err);
                setLoading(false);
            });
    }, [server]);

    const handlePropertyChange = (key: string, value: string) => {
        setProperties((prev) => ({ ...prev, [key]: value }));
    };

    const handleMaxPlayersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMaxPlayersStr(val);

        if (val.trim() === '') {
            setPlayersError('Debe ingresar al menos un número para los jugadores máximos.');
        } else if (isNaN(Number(val)) || Number(val) < 0) {
            setPlayersError('Por favor, introduce un número válido superior o igual a 0.');
        } else {
            setPlayersError('');
            handlePropertyChange('max-players', val.trim());
        }
    };

    const handleSave = () => {
        if (!server || playersError) return;

        setSaving(true);

        // Volver a construir el archivo con formato plano de propiedades
        let fileContent = '#Generado y guardado desde el Panel - Ajustes MC\n';
        Object.entries(properties).forEach(([key, value]) => {
            fileContent += `${key}=${value}\n`;
        });

        http.post(`/api/client/servers/${server.uuid}/files/write`, fileContent, {
            params: { file: filePath },
            headers: { 'Content-Type': 'text/plain' },
        })
            .then(() => {
                alert('¡Configuración guardada correctamente! Recuerda reiniciar el servidor para aplicar los cambios.');
                setSaving(false);
            })
            .catch((err) => {
                console.error('Error al guardar el archivo:', err);
                alert('Hubo un error al intentar guardar la configuración.');
                setSaving(false);
            });
    };

    if (loading) return <Spinner size={'large'} centered />;

    return (
        <div className='p-6 md:p-10 w-full max-w-6xl mx-auto my-4 text-gray-200'>
            <div className='flex justify-between items-center mb-6 border-b border-gray-700 pb-4'>
                <div>
                    <h1 className='text-2xl font-bold text-white'>Ajustes Avanzados de Minecraft</h1>
                    <p className='text-sm text-gray-400 mt-1'>Gestiona de forma visual los parámetros principales de tu archivo server.properties.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving || !!playersError}
                    className={`px-6 py-2.5 rounded font-semibold text-sm transition-all shadow ${
                        saving || !!playersError
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                    }`}
                >
                    {saving ? 'Guardando...' : 'GUARDAR CONFIGURACIÓN'}
                </button>
            </div>

            {/* SECCIÓN 1: DESCRIPCIÓN DEL SERVIDOR (MOTD) */}
            <div className='bg-gray-800 bg-opacity-50 p-5 rounded-lg border border-gray-700 mb-6 shadow-sm'>
                <label className='block text-sm font-bold uppercase tracking-wider text-gray-300 mb-2'>
                    Descripción del servidor (MOTD)
                </label>
                <input
                    type='text'
                    value={properties['motd'] || ''}
                    onChange={(e) => handlePropertyChange('motd', e.target.value)}
                    className='w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors'
                    placeholder='Aparecerá en la lista de servidores de Minecraft...'
                />
                <span className='text-xs font-mono text-gray-500 mt-1.5 block bg-gray-900 bg-opacity-40 p-1 rounded w-max px-2 border border-gray-800'>Parámetro interno: motd=</span>
            </div>

            {/* SECCIÓN 2: GRILLA DE OPCIONES PRINCIPALES */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                
                {/* CONFIGURACIONES GENERALES DEL MUNDO */}
                <div className='bg-gray-800 bg-opacity-50 p-5 rounded-lg border border-gray-700 shadow-sm flex flex-col gap-4'>
                    <h3 className='text-md font-bold text-red-400 uppercase border-b border-gray-700 pb-2 mb-2'>Ajustes del Mundo</h3>
                    
                    {/* Semilla del Mundo */}
                    <div>
                        <label className='block text-xs font-semibold uppercase text-gray-400 mb-1'>Semilla del mundo (Level Seed)</label>
                        <input
                            type='text'
                            value={properties['level-seed'] || ''}
                            onChange={(e) => handlePropertyChange('level-seed', e.target.value)}
                            className='w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-red-500'
                        />
                        <span className='text-[10px] font-mono text-gray-500 mt-1 block'>Parámetro interno: level-seed=</span>
                    </div>

                    {/* Máximo de Jugadores (Validado) */}
                    <div>
                        <label className='block text-xs font-semibold uppercase text-gray-400 mb-1'>Máximo de jugadores</label>
                        <input
                            type='text'
                            value={maxPlayersStr}
                            onChange={handleMaxPlayersChange}
                            className={`w-full bg-gray-900 border rounded px-3 py-1.5 text-sm text-white focus:outline-none transition-colors ${
                                playersError ? 'border-red-500 focus:border-red-600 bg-red-950 bg-opacity-20' : 'border-gray-700 focus:border-red-500'
                            }`}
                        />
                        {playersError && (
                            <p className='text-red-400 text-xs mt-1.5 font-medium bg-red-900 bg-opacity-20 p-2 rounded border border-red-900'>{playersError}</p>
                        )}
                        <span className='text-[10px] font-mono text-gray-500 mt-1 block'>Parámetro interno: max-players=</span>
                    </div>

                    {/* Protección de Spawn */}
                    <div>
                        <label className='block text-xs font-semibold uppercase text-gray-400 mb-1'>Protección de Spawn (Bloques)</label>
                        <input
                            type='number'
                            value={properties['spawn-protection'] || '0'}
                            onChange={(e) => handlePropertyChange('spawn-protection', e.target.value)}
                            className='w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-red-500'
                        />
                        <span className='text-[10px] font-mono text-gray-500 mt-1 block'>Parámetro interno: spawn-protection=</span>
                    </div>
                </div>

                {/* MODOS Y SELECTORES */}
                <div className='bg-gray-800 bg-opacity-50 p-5 rounded-lg border border-gray-700 shadow-sm flex flex-col gap-4'>
                    <h3 className='text-md font-bold text-red-400 uppercase border-b border-gray-700 pb-2 mb-2'>Reglas del Servidor</h3>
                    
                    {/* Selector de Modo de Juego */}
                    <div>
                        <label className='block text-xs font-semibold uppercase text-gray-400 mb-1'>Modo de juego</label>
                        <select
                            value={properties['gamemode'] || 'survival'}
                            onChange={(e) => handlePropertyChange('gamemode', e.target.value)}
                            className='w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-red-500'
                        >
                            <option value='survival'>Supervivencia (Survival)</option>
                            <option value='creative'>Creativo (Creative)</option>
                            <option value='adventure'>Aventura (Adventure)</option>
                            <option value='spectator'>Espectador (Spectator)</option>
                        </select>
                        <span className='text-[10px] font-mono text-gray-500 mt-1 block'>Parámetro interno: gamemode=</span>
                    </div>

                    {/* Selector de Dificultad */}
                    <div>
                        <label className='block text-xs font-semibold uppercase text-gray-400 mb-1'>Dificultad</label>
                        <select
                            value={properties['difficulty'] || 'easy'}
                            onChange={(e) => handlePropertyChange('difficulty', e.target.value)}
                            className='w-full bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-red-500'
                        >
                            <option value='peaceful'>Pacífico</option>
                            <option value='easy'>Fácil</option>
                            <option value='normal'>Normal</option>
                            <option value='hard'>Difícil</option>
                        </select>
                        <span className='text-[10px] font-mono text-gray-500 mt-1 block'>Parámetro interno: difficulty=</span>
                    </div>

                    {/* Switch Hardcore */}
                    <div className='flex justify-between items-center bg-gray-900 bg-opacity-60 p-3 rounded border border-gray-700 mt-2 hover:border-gray-600 transition-colors'>
                        <div>
                            <span className='block text-sm font-semibold text-white'>Modo Extremo (Hardcore)</span>
                            <span className='text-[10px] font-mono text-gray-500 block mt-0.5'>Parámetro interno: hardcore=</span>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer select-none shadow-inner'>
                            <input
                                type='checkbox'
                                checked={properties['hardcore'] === 'true'}
                                onChange={(e) => handlePropertyChange('hardcore', e.target.checked ? 'true' : 'false')}
                                className='sr-only peer'
                            />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-500/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 3: RECURSOS COMPLEMENTARIOS */}
            <div className='bg-gray-800 bg-opacity-50 p-5 rounded-lg border border-gray-700 mt-6 shadow-sm'>
                <h3 className='text-md font-bold text-red-400 uppercase border-b border-gray-700 pb-2 mb-4'>Paquetes de Recursos (Resource Packs)</h3>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 items-start'>
                    {/* Switch obligatorio de Resource Pack */}
                    <div className='flex justify-between items-center bg-gray-900 p-4 rounded border border-gray-800 hover:border-gray-700 transition-colors h-[76px]'>
                        <div>
                            <span className='block text-sm font-semibold text-white'>Obligar paquete de recursos</span>
                            <span className='text-xs text-gray-400 block max-w-xs'>Echa a los jugadores si rechazan la descarga</span>
                            <span className='text-[10px] font-mono text-gray-500 block mt-0.5'>Parámetro interno: require-resource-pack=</span>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer select-none'>
                            <input
                                type='checkbox'
                                checked={properties['require-resource-pack'] === 'true'}
                                onChange={(e) => handlePropertyChange('require-resource-pack', e.target.checked ? 'true' : 'false')}
                                className='sr-only peer'
                            />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-500/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>

                    {/* Entrada de texto de prompt */}
                    <div>
                        <label className='block text-xs font-semibold uppercase text-gray-400 mb-1'>Mensaje de paquete de recursos (Resource Pack Prompt)</label>
                        <input
                            type='text'
                            value={properties['resource-pack-prompt'] || ''}
                            onChange={(e) => handlePropertyChange('resource-pack-prompt', e.target.value)}
                            className='w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500'
                            placeholder='Mensaje personalizado en pantalla...'
                        />
                        <span className='text-[10px] font-mono text-gray-500 mt-1 block'>Parámetro interno: resource-pack-prompt=</span>
                    </div>
                </div>
            </div>

            {/* SECCIÓN 4: INTERRUPTORES / SWITCHES ESTILO ATERNOS */}
            <div className='bg-gray-800 bg-opacity-50 p-5 rounded-lg border border-gray-700 mt-6 shadow-sm'>
                <h3 className='text-md font-bold text-red-400 uppercase border-b border-gray-700 pb-2 mb-4'>Opciones de Red y Seguridad</h3>
                
                <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4'>
                    {/* Whitelist Obligatoria */}
                    <div className='flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-800 hover:border-gray-700 transition-colors'>
                        <div>
                            <span className='block text-sm font-semibold text-white'>Lista blanca (Whitelist)</span>
                            <span className='text-xs text-gray-500 block'>Solo entran usuarios permitidos</span>
                            <span className='text-[10px] font-mono text-gray-500 block mt-0.5'>Parámetro interno: white-list=</span>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer select-none'>
                            <input
                                type='checkbox'
                                checked={properties['white-list'] === 'true'}
                                onChange={(e) => handlePropertyChange('white-list', e.target.checked ? 'true' : 'false')}
                                className='sr-only peer'
                            />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-500/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>

                    {/* Online Mode / Craqueado */}
                    <div className='flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-800 hover:border-gray-700 transition-colors'>
                        <div>
                            <span className='block text-sm font-semibold text-white'>Permitir cuentas No-Premium (Craqueado)</span>
                            <span className='text-xs text-gray-500 block'>Desactiva la validación oficial con Mojang</span>
                            <span className='text-[10px] font-mono text-gray-500 block mt-0.5'>Parámetro interno: online-mode= (invertido)</span>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer select-none'>
                            <input
                                type='checkbox'
                                checked={properties['online-mode'] === 'false'}
                                onChange={(e) => handlePropertyChange('online-mode', e.target.checked ? 'false' : 'true')}
                                className='sr-only peer'
                            />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-500/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>

                    {/* Allow Flight */}
                    <div className='flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-800 hover:border-gray-700 transition-colors'>
                        <div>
                            <span className='block text-sm font-semibold text-white'>Permitir Volar (Allow Flight)</span>
                            <span className='text-xs text-gray-500 block'>Evita expulsiones automáticas por uso de mods de vuelo</span>
                            <span className='text-[10px] font-mono text-gray-500 block mt-0.5'>Parámetro interno: allow-flight=</span>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer select-none'>
                            <input
                                type='checkbox'
                                checked={properties['allow-flight'] === 'true'}
                                onChange={(e) => handlePropertyChange('allow-flight', e.target.checked ? 'true' : 'false')}
                                className='sr-only peer'
                            />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-500/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>

                    {/* Force Gamemode */}
                    <div className='flex justify-between items-center bg-gray-900 p-3 rounded border border-gray-800 hover:border-gray-700 transition-colors'>
                        <div>
                            <span className='block text-sm font-semibold text-white'>Forzar modo de juego</span>
                            <span className='text-xs text-gray-500 block'>Obliga a los jugadores a unirse en el modo por defecto</span>
                            <span className='text-[10px] font-mono text-gray-500 block mt-0.5'>Parámetro interno: force-gamemode=</span>
                        </div>
                        <label className='relative inline-flex items-center cursor-pointer select-none'>
                            <input
                                type='checkbox'
                                checked={properties['force-gamemode'] === 'true'}
                                onChange={(e) => handlePropertyChange('force-gamemode', e.target.checked ? 'true' : 'false')}
                                className='sr-only peer'
                            />
                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-500/30 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-gray-200 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};