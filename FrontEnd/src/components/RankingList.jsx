// src/components/RankingList.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Award, Star } from 'lucide-react';

const RankingList = ({ ranking, currentUserId }) => {
    const getRankBadge = (position) => {
        switch (position) {
            case 1:
                return <Trophy className="w-6 h-6 text-yellow-400" />;
            case 2:
                return <Crown className="w-6 h-6 text-gray-400" />;
            case 3:
                return <Award className="w-6 h-6 text-amber-600" />;
            default:
                return <span className="text-sm font-bold text-muted-foreground">#{position}</span>;
        }
    };

    return (
        <div className="space-y-3">
            {ranking.map((user, index) => {
                const position = index + 1;
                const isCurrentUser = user.id === currentUserId;
                
                return (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-lg border ${
                            isCurrentUser 
                                ? 'bg-primary/10 border-primary/30' 
                                : 'bg-background border-border'
                        } ${position <= 3 ? 'shadow-lg' : ''}`}
                    >
                        <div className="flex items-center justify-center w-8">
                            {getRankBadge(position)}
                        </div>
                        
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                            user.rankColor && user.rankColor.includes('from-') 
                                ? `bg-gradient-to-br ${user.rankColor}`
                                : 'bg-muted'
                        }`}>
                            {user.rankIcon || '👤'}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className={`font-semibold truncate ${
                                    isCurrentUser ? 'text-primary' : 'text-foreground'
                                }`}>
                                    {user.nombre}
                                    {isCurrentUser && <span className="ml-2 text-xs text-primary">(Tú)</span>}
                                </p>
                            </div>
                            <p className="text-sm text-muted-foreground">{user.rango}</p>
                        </div>
                        
                        <div className="text-right">
                            <div className="flex items-center gap-1 justify-end">
                                <Star className="w-4 h-4 text-amber-400" />
                                <span className="font-bold text-foreground">{user.puntos}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">puntos</p>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default RankingList;