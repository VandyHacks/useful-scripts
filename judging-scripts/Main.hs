{-# LANGUAGE LambdaCase        #-}
{-# LANGUAGE OverloadedStrings #-}

module Main where

import           Control.Applicative
import           Control.Monad
import qualified Data.ByteString.Lazy as BL
import           Data.Csv
import           Data.IORef
import qualified Data.List            as L
import qualified Data.Map             as M
import           Data.Maybe
import           Data.Ord
import qualified Data.Text            as T
import           Lens.Micro
import           Types

weightedSum :: ScoreRow -> MInt
weightedSum x = foldr (\s res -> add (x ^. s) . res) (add (MInt (Just 0))) selectors (MInt (Just 0))
  where
    selectors = [technicalAbility, utility, creativity, presentation, impression]
    add (MInt (Just x)) (MInt (Just y)) = MInt (Just (x + y))
    add _ _                             = MInt Nothing

getData s = do
  f <- BL.readFile s
  case decode HasHeader f of
    Right l  -> pure l
    Left err -> error err

ins tNum score = M.adjust f tNum
  where
    f (count, acc) = (count + 1, acc + score)

main = do
  dat <- getData "responses1.csv"
  let g x = (x^.table.val, weightedSum x)
  putStrLn "Table\tAverage Score"
  table <- newIORef mempty
  forM_ (g <$> dat)
    (\case
       (Just x, MInt (Just y)) -> do
         t <- readIORef table
         when (isNothing (M.lookup x t)) (modifyIORef table (M.insert x (0,0)))
         modifyIORef table (ins x y)
       _ -> pure ())
  res <- readIORef table
  let h (t, (c,s)) = (t,fromIntegral s / fromIntegral c)
  let f (a, b) = putStrLn (show a <> "\t" <> show b)
  mapM_ f (L.take 20 (L.sortOn (Down . snd) (h <$> M.toList res)))
